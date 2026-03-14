/**
 * AI Provider Types
 * Multi-provider abstraction for AI-powered features
 */

export type AIProvider = 'claude' | 'gemini' | 'openai' | 'grok';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface AIError {
  code:
    | 'INVALID_API_KEY'
    | 'RATE_LIMIT'
    | 'QUOTA_EXCEEDED'
    | 'PROVIDER_ERROR'
    | 'NETWORK_ERROR';
  message: string;
  provider: AIProvider;
  details?: unknown;
}

export interface SupplierSummaryInput {
  supplierName: string;
  tier: number;
  currentRiskScore: number;
  status: string;
  country: string;
  recentEvents?: string[];
  openIncidents?: number;
}

export interface RiskEventSummaryInput {
  eventType: string;
  severity: string;
  title: string;
  description: string;
  affectedRegions: string[];
  impactedSuppliers?: number;
}

export interface DashboardInsightsInput {
  totalSuppliers: number;
  atRiskSuppliers: number;
  activeIncidents: number;
  recentEvents: Array<{
    type: string;
    severity: string;
    title: string;
  }>;
  topRiskSuppliers: Array<{
    name: string;
    score: number;
  }>;
}
