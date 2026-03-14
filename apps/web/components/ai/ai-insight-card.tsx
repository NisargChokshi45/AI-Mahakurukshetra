'use client';

/**
 * AI Insight Card Component
 * Displays AI-generated content with proper loading and error states
 */

import { AlertCircle, Brain, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AIInsightCardProps {
  title: string;
  description?: string;
  content?: string;
  isLoading?: boolean;
  error?: {
    message: string;
    code?: string;
  } | null;
  provider?: string;
  onRetry?: () => void;
}

const ERROR_MESSAGES: Record<
  string,
  { title: string; description: string; actionable: boolean }
> = {
  INVALID_API_KEY: {
    title: 'AI Configuration Required',
    description:
      'Please configure an AI provider API key in Settings to enable AI-powered insights.',
    actionable: true,
  },
  QUOTA_EXCEEDED: {
    title: 'AI Credit Limit Reached',
    description:
      'Your AI provider credit limit has been exceeded. Please check your billing settings or switch to a different provider.',
    actionable: true,
  },
  RATE_LIMIT: {
    title: 'Rate Limit Exceeded',
    description: 'Too many AI requests. Please try again in a few moments.',
    actionable: false,
  },
  PROVIDER_ERROR: {
    title: 'AI Service Unavailable',
    description:
      'The AI service is temporarily unavailable. Please try again later.',
    actionable: false,
  },
  NETWORK_ERROR: {
    title: 'Connection Error',
    description:
      'Failed to connect to AI service. Please check your internet connection.',
    actionable: false,
  },
};

export function AIInsightCard({
  title,
  description,
  content,
  isLoading = false,
  error = null,
  provider,
  onRetry,
}: AIInsightCardProps) {
  const errorInfo = error?.code ? ERROR_MESSAGES[error.code] : null;

  return (
    <Card className="border-purple-200 dark:border-purple-900">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {provider && !error && !isLoading && (
            <Badge variant="secondary" className="ml-2">
              <Brain className="mr-1 h-3 w-3" />
              {provider}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="text-muted-foreground flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Generating AI insights...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{errorInfo?.title || 'AI Error'}</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{errorInfo?.description || error.message}</p>
              {errorInfo?.actionable && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href="/settings/integrations">Configure AI Settings</a>
                  </Button>
                  {onRetry && (
                    <Button size="sm" variant="outline" onClick={onRetry}>
                      Try Again
                    </Button>
                  )}
                </div>
              )}
              {!errorInfo?.actionable && onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  Try Again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && content && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>
        )}

        {!isLoading && !error && !content && (
          <p className="text-muted-foreground text-sm">
            No insights available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
