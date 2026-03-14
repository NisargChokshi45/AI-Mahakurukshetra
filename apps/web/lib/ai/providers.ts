/**
 * AI Provider Implementation
 * Supports Claude (Anthropic), Gemini (Google), OpenAI, and Grok (xAI)
 */

import type {
  AIError,
  AIMessage,
  AIProvider,
  AIProviderConfig,
  AIResponse,
} from './types';

/**
 * Abstract base class for AI providers
 */
abstract class BaseAIProvider {
  protected apiKey: string;
  protected model: string;
  protected provider: AIProvider;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.provider = config.provider;
    this.model = config.model || this.getDefaultModel();
  }

  abstract getDefaultModel(): string;
  abstract generateCompletion(messages: AIMessage[]): Promise<AIResponse>;

  protected createError(
    code: AIError['code'],
    message: string,
    details?: unknown,
  ): AIError {
    return {
      code,
      message,
      provider: this.provider,
      details,
    };
  }
}

/**
 * Claude (Anthropic) Provider
 */
class ClaudeProvider extends BaseAIProvider {
  getDefaultModel(): string {
    return 'claude-3-5-sonnet-20241022';
  }

  async generateCompletion(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          messages: messages.filter((m) => m.role !== 'system'),
          system: messages.find((m) => m.role === 'system')?.content,
        }),
      });

      if (!response.ok) {
        return this.handleError(response);
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        provider: this.provider,
        model: data.model,
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
        },
      };
    } catch (error) {
      throw this.createError(
        'NETWORK_ERROR',
        'Failed to connect to Claude API',
        error,
      );
    }
  }

  private async handleError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw this.createError(
        'INVALID_API_KEY',
        'Invalid Claude API key. Please check your configuration.',
        errorData,
      );
    }

    if (response.status === 429) {
      throw this.createError(
        'RATE_LIMIT',
        'Claude API rate limit exceeded. Please try again later.',
        errorData,
      );
    }

    if (
      response.status === 402 ||
      errorData.error?.type === 'insufficient_quota'
    ) {
      throw this.createError(
        'QUOTA_EXCEEDED',
        'Claude API quota exceeded. Please check your billing settings.',
        errorData,
      );
    }

    throw this.createError(
      'PROVIDER_ERROR',
      `Claude API error: ${errorData.error?.message || response.statusText}`,
      errorData,
    );
  }
}

/**
 * Gemini (Google) Provider
 */
class GeminiProvider extends BaseAIProvider {
  getDefaultModel(): string {
    return 'gemini-2.0-flash-exp';
  }

  async generateCompletion(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const systemInstruction = messages.find(
        (m) => m.role === 'system',
      )?.content;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstruction
              ? { parts: [{ text: systemInstruction }] }
              : undefined,
          }),
        },
      );

      if (!response.ok) {
        return this.handleError(response);
      }

      const data = await response.json();
      return {
        content: data.candidates[0].content.parts[0].text,
        provider: this.provider,
        model: this.model,
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount || 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
        },
      };
    } catch (error) {
      throw this.createError(
        'NETWORK_ERROR',
        'Failed to connect to Gemini API',
        error,
      );
    }
  }

  private async handleError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({}));

    if (
      response.status === 400 &&
      errorData.error?.message?.includes('API key')
    ) {
      throw this.createError(
        'INVALID_API_KEY',
        'Invalid Gemini API key. Please check your configuration.',
        errorData,
      );
    }

    if (response.status === 429) {
      throw this.createError(
        'RATE_LIMIT',
        'Gemini API rate limit exceeded. Please try again later.',
        errorData,
      );
    }

    if (errorData.error?.message?.includes('quota')) {
      throw this.createError(
        'QUOTA_EXCEEDED',
        'Gemini API quota exceeded. Please check your billing settings.',
        errorData,
      );
    }

    throw this.createError(
      'PROVIDER_ERROR',
      `Gemini API error: ${errorData.error?.message || response.statusText}`,
      errorData,
    );
  }
}

/**
 * OpenAI Provider
 */
class OpenAIProvider extends BaseAIProvider {
  getDefaultModel(): string {
    return 'gpt-4o';
  }

  async generateCompletion(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            max_tokens: 1024,
          }),
        },
      );

      if (!response.ok) {
        return this.handleError(response);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        provider: this.provider,
        model: data.model,
        usage: {
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
        },
      };
    } catch (error) {
      throw this.createError(
        'NETWORK_ERROR',
        'Failed to connect to OpenAI API',
        error,
      );
    }
  }

  private async handleError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw this.createError(
        'INVALID_API_KEY',
        'Invalid OpenAI API key. Please check your configuration.',
        errorData,
      );
    }

    if (response.status === 429) {
      const message = errorData.error?.message || '';
      if (message.includes('quota')) {
        throw this.createError(
          'QUOTA_EXCEEDED',
          'OpenAI API quota exceeded. Please check your billing settings.',
          errorData,
        );
      }
      throw this.createError(
        'RATE_LIMIT',
        'OpenAI API rate limit exceeded. Please try again later.',
        errorData,
      );
    }

    throw this.createError(
      'PROVIDER_ERROR',
      `OpenAI API error: ${errorData.error?.message || response.statusText}`,
      errorData,
    );
  }
}

/**
 * Grok (xAI) Provider
 */
class GrokProvider extends BaseAIProvider {
  getDefaultModel(): string {
    return 'grok-2-latest';
  }

  async generateCompletion(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        return this.handleError(response);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        provider: this.provider,
        model: data.model,
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
        },
      };
    } catch (error) {
      throw this.createError(
        'NETWORK_ERROR',
        'Failed to connect to Grok API',
        error,
      );
    }
  }

  private async handleError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw this.createError(
        'INVALID_API_KEY',
        'Invalid Grok API key. Please check your configuration.',
        errorData,
      );
    }

    if (response.status === 429) {
      throw this.createError(
        'RATE_LIMIT',
        'Grok API rate limit exceeded. Please try again later.',
        errorData,
      );
    }

    if (
      errorData.error?.message?.includes('quota') ||
      errorData.error?.message?.includes('credit')
    ) {
      throw this.createError(
        'QUOTA_EXCEEDED',
        'Grok API quota exceeded. Please check your billing settings.',
        errorData,
      );
    }

    throw this.createError(
      'PROVIDER_ERROR',
      `Grok API error: ${errorData.error?.message || response.statusText}`,
      errorData,
    );
  }
}

/**
 * Factory function to create AI provider instances
 */
export function createAIProvider(config: AIProviderConfig): BaseAIProvider {
  switch (config.provider) {
    case 'claude':
      return new ClaudeProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'grok':
      return new GrokProvider(config);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}
