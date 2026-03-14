'use client';

/**
 * AI Settings Form
 * Configure AI provider and API keys for the organization
 */

import { useState, useMemo } from 'react';
import { Brain, Check, Loader2 } from 'lucide-react';
import { ModelInfoMap } from 'llm-info';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/dashboard/ui';

const AI_PROVIDERS = [
  {
    value: 'claude',
    label: 'Claude (Anthropic)',
    defaultModel: 'claude-3-5-sonnet-20241022',
    modelIds: [
      'claude-opus-4-5-20251101',
      'claude-sonnet-4-5-20250929',
      'claude-haiku-4-5-20251001',
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ],
  },
  {
    value: 'gemini',
    label: 'Gemini (Google)',
    defaultModel: 'gemini-2.5-flash',
    modelIds: [
      'gemini-3-pro-preview',
      'gemini-2.5-pro',
      'gemini-2.5-pro-preview-06-05',
      'gemini-2.5-flash',
      'gemini-2.5-flash-preview-05-20',
    ],
  },
  {
    value: 'openai',
    label: 'OpenAI',
    defaultModel: 'gpt-4o',
    modelIds: [
      'gpt-5.2-pro',
      'gpt-5.2',
      'gpt-5',
      'gpt-4.1',
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'o4-mini',
      'o3',
      'o3-mini',
      'o1',
      'o1-mini',
    ],
  },
  {
    value: 'grok',
    label: 'Grok (xAI)',
    defaultModel: 'grok-4',
    modelIds: ['grok-4', 'grok-code-fast-1'],
  },
];

interface AISettingsFormProps {
  initialSettings?: {
    provider: string;
    model?: string;
    hasApiKey: boolean;
  } | null;
}

export function AISettingsForm({ initialSettings }: AISettingsFormProps) {
  const [provider, setProvider] = useState(
    initialSettings?.provider || 'claude',
  );
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(
    initialSettings?.model ||
      AI_PROVIDERS.find((p) => p.value === provider)?.defaultModel ||
      '',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const defaultModel =
      AI_PROVIDERS.find((p) => p.value === newProvider)?.defaultModel || '';
    setModel(defaultModel);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKey || undefined, // Only send if changed
          model: model || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      setSaveStatus({
        type: 'success',
        message: 'AI settings saved successfully! AI insights are now enabled.',
      });
      setApiKey(''); // Clear the API key input after saving
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to save settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProvider = AI_PROVIDERS.find((p) => p.value === provider);

  // Get available models for the selected provider with metadata
  const availableModels = useMemo(() => {
    if (!selectedProvider) return [];

    return selectedProvider.modelIds
      .map((modelId) => {
        const modelInfo = ModelInfoMap[modelId as keyof typeof ModelInfoMap];
        if (!modelInfo) return null;

        return {
          id: modelId,
          name: modelInfo.name || modelId,
          contextWindow: modelInfo.contextWindowTokenLimit || 0,
          inputPrice: modelInfo.pricePerMillionInputTokens || 0,
          outputPrice: modelInfo.pricePerMillionOutputTokens || 0,
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
  }, [selectedProvider]);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="provider">AI Provider</Label>
          <SelectField
            id="provider"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            disabled={isSaving}
          >
            {AI_PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </SelectField>
          <p className="text-muted-foreground text-xs">
            Select your preferred AI provider for generating insights
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="apiKey">
            API Key{' '}
            {initialSettings?.hasApiKey && (
              <span className="text-green-600">(Configured)</span>
            )}
          </Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              initialSettings?.hasApiKey
                ? '••••••••••••••••'
                : 'Enter your API key'
            }
            disabled={isSaving}
          />
          <p className="text-muted-foreground text-xs">
            {initialSettings?.hasApiKey
              ? 'Leave blank to keep existing key, or enter a new key to update'
              : `Get your API key from ${selectedProvider?.label}`}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="model">Model</Label>
          <SelectField
            id="model"
            value={model || selectedProvider?.defaultModel || ''}
            onChange={(e) => setModel(e.target.value)}
            disabled={isSaving}
          >
            {availableModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} - {m.contextWindow / 1000}K ctx - $
                {m.inputPrice.toFixed(2)}/$
                {m.outputPrice.toFixed(2)} per M tokens
              </option>
            ))}
          </SelectField>
          <p className="text-muted-foreground text-xs">
            Select the AI model to use for generating insights. Default:{' '}
            {selectedProvider?.defaultModel}
          </p>
        </div>
      </div>

      {saveStatus && (
        <Alert
          variant={saveStatus.type === 'error' ? 'destructive' : 'default'}
        >
          {saveStatus.type === 'success' && <Check className="h-4 w-4" />}
          <AlertDescription>{saveStatus.message}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isSaving || (!apiKey && !initialSettings?.hasApiKey)}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Brain className="mr-2 h-4 w-4" />
            Save AI Configuration
          </>
        )}
      </Button>

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/20">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Brain className="h-4 w-4 text-purple-600" />
          AI-Powered Features
        </h4>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>• Supplier health summaries and risk narratives</li>
          <li>• Risk event impact analysis and recommendations</li>
          <li>• Dashboard insights and trend analysis</li>
          <li>• Business impact cost assessments</li>
        </ul>
      </div>
    </form>
  );
}
