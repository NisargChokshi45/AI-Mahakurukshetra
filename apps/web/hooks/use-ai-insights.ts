'use client';

/**
 * AI Insights Hook
 * Reusable hook for fetching AI-powered insights
 */

import { useState, useCallback, useEffect } from 'react';

interface AIResponse {
  summary?: string;
  insights?: string;
  provider?: string;
  model?: string;
}

interface AIError {
  error: string;
  errorCode?: string;
  provider?: string;
}

interface UseAIInsightsOptions {
  endpoint: string;
  payload?: Record<string, unknown>;
  autoFetch?: boolean;
}

export function useAIInsights({
  endpoint,
  payload,
  autoFetch = false,
}: UseAIInsightsOptions) {
  const [data, setData] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(
    null,
  );

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorData = result as AIError;
        setError({
          message: errorData.error || 'Failed to generate insights',
          code: errorData.errorCode,
        });
        setData(null);
        return;
      }

      setData(result);
      setError(null);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Network error',
        code: 'NETWORK_ERROR',
      });
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, payload]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      void fetchInsights();
    }
  }, [autoFetch, fetchInsights]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchInsights,
  };
}
