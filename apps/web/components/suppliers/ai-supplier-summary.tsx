'use client';

/**
 * AI Supplier Summary Component
 * Displays AI-powered supplier health summary
 */

import { useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { AIInsightCard } from '@/components/ai/ai-insight-card';
import { SectionCard } from '@/components/dashboard/ui';
import { useAIInsights } from '@/hooks/use-ai-insights';

interface AISupplierSummaryProps {
  supplierId: string;
}

export function AISupplierSummary({ supplierId }: AISupplierSummaryProps) {
  const payload = useMemo(() => ({ supplierId }), [supplierId]);
  const { data, isLoading, error, refetch } = useAIInsights({
    endpoint: '/api/ai/supplier-summary',
    payload,
    autoFetch: false,
  });

  // Auto-fetch on mount or when supplier changes
  useEffect(() => {
    void refetch();
  }, [supplierId, refetch]);

  if (error && !isLoading) {
    const errorMessage = error.message || 'AI summary unavailable.';

    return (
      <SectionCard
        eyebrow="AI Health"
        title="AI Health Summary"
        description="AI-powered supplier risk analysis and recommendations"
      >
        <div className="border-border/70 bg-background/70 flex items-center gap-3 rounded-[20px] border px-4 py-3 text-sm">
          <AlertCircle className="text-destructive h-4 w-4" />
          <span className="text-destructive font-medium whitespace-nowrap">
            AI service error
          </span>
          <span
            className="text-muted-foreground min-w-0 flex-1 truncate"
            title={errorMessage}
          >
            {errorMessage}
          </span>
        </div>
      </SectionCard>
    );
  }

  return (
    <AIInsightCard
      title="AI Health Summary"
      description="AI-powered supplier risk analysis and recommendations"
      content={data?.summary}
      isLoading={isLoading}
      error={error}
      provider={data?.provider}
      onRetry={refetch}
    />
  );
}
