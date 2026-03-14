/**
 * AI Client
 * Unified client for AI-powered features with multi-provider support
 */

import { createClient } from '../supabase/server';
import { createAIProvider } from './providers';
import type {
  AIError,
  AIProvider,
  AIProviderConfig,
  AIResponse,
  DashboardInsightsInput,
  RiskEventSummaryInput,
  SupplierSummaryInput,
} from './types';
import {
  createDashboardInsightsPrompt,
  createRiskEventSummaryPrompt,
  createSupplierSummaryPrompt,
} from './prompts';

/**
 * Get AI provider configuration for an organization
 * Falls back to environment variables if not configured in database
 */
async function getAIProviderConfig(
  orgId: string,
): Promise<AIProviderConfig | null> {
  const supabase = await createClient();

  // Check if org has AI settings configured
  const { data: settings } = await supabase
    .from('ai_settings')
    .select('provider, api_key, model')
    .eq('organization_id', orgId)
    .eq('enabled', true)
    .single();

  if (settings?.api_key) {
    return {
      provider: settings.provider as AIProvider,
      apiKey: settings.api_key,
      model: settings.model || undefined,
    };
  }

  // Fallback to environment variables
  // Try providers in order: Claude -> Gemini -> OpenAI -> Grok
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'claude',
      apiKey: process.env.ANTHROPIC_API_KEY,
    };
  }

  if (process.env.GOOGLE_AI_API_KEY) {
    return {
      provider: 'gemini',
      apiKey: process.env.GOOGLE_AI_API_KEY,
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
    };
  }

  if (process.env.GROK_API_KEY) {
    return {
      provider: 'grok',
      apiKey: process.env.GROK_API_KEY,
    };
  }

  return null;
}

/**
 * Generate supplier health summary using AI
 */
export async function generateSupplierSummary(
  orgId: string,
  input: SupplierSummaryInput,
): Promise<
  { success: true; data: AIResponse } | { success: false; error: AIError }
> {
  try {
    const config = await getAIProviderConfig(orgId);

    if (!config) {
      return {
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message:
            'No AI provider configured. Please add an API key in Settings.',
          provider: 'claude', // Default for error reporting
        },
      };
    }

    const provider = createAIProvider(config);
    const messages = createSupplierSummaryPrompt(input);
    const response = await provider.generateCompletion(messages);

    return { success: true, data: response };
  } catch (error) {
    // If it's already an AIError, return it
    if (error && typeof error === 'object' && 'code' in error) {
      return { success: false, error: error as AIError };
    }

    // Otherwise create a generic error
    return {
      success: false,
      error: {
        code: 'PROVIDER_ERROR',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        provider: 'claude',
        details: error,
      },
    };
  }
}

/**
 * Generate risk event analysis using AI
 */
export async function generateRiskEventSummary(
  orgId: string,
  input: RiskEventSummaryInput,
): Promise<
  { success: true; data: AIResponse } | { success: false; error: AIError }
> {
  try {
    const config = await getAIProviderConfig(orgId);

    if (!config) {
      return {
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message:
            'No AI provider configured. Please add an API key in Settings.',
          provider: 'claude',
        },
      };
    }

    const provider = createAIProvider(config);
    const messages = createRiskEventSummaryPrompt(input);
    const response = await provider.generateCompletion(messages);

    return { success: true, data: response };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      return { success: false, error: error as AIError };
    }

    return {
      success: false,
      error: {
        code: 'PROVIDER_ERROR',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        provider: 'claude',
        details: error,
      },
    };
  }
}

/**
 * Generate dashboard insights using AI
 */
export async function generateDashboardInsights(
  orgId: string,
  input: DashboardInsightsInput,
): Promise<
  { success: true; data: AIResponse } | { success: false; error: AIError }
> {
  try {
    const config = await getAIProviderConfig(orgId);

    if (!config) {
      return {
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message:
            'No AI provider configured. Please add an API key in Settings.',
          provider: 'claude',
        },
      };
    }

    const provider = createAIProvider(config);
    const messages = createDashboardInsightsPrompt(input);
    const response = await provider.generateCompletion(messages);

    return { success: true, data: response };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      return { success: false, error: error as AIError };
    }

    return {
      success: false,
      error: {
        code: 'PROVIDER_ERROR',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        provider: 'claude',
        details: error,
      },
    };
  }
}
