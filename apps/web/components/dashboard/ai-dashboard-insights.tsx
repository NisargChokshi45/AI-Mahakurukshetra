'use client';

/**
 * AI Dashboard Insights Component
 * Displays AI-powered executive insights on the dashboard
 */

import { useEffect } from 'react';
import { AIInsightCard } from '@/components/ai/ai-insight-card';
import { useAIInsights } from '@/hooks/use-ai-insights';

export function AIDashboardInsights() {
  const { data, isLoading, error, refetch } = useAIInsights({
    endpoint: '/api/ai/dashboard-insights',
    autoFetch: false,
  });

  // Auto-fetch on mount
  useEffect(() => {
    void refetch();
  }, [refetch]);

  return (
    <AIInsightCard
      title="AI Executive Insights"
      description="AI-powered analysis of your supply chain risk landscape"
      content={data?.insights}
      isLoading={isLoading}
      error={error}
      provider={data?.provider}
      onRetry={refetch}
    />
  );
}
