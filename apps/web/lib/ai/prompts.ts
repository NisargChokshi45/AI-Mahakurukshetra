/**
 * AI Prompt Templates
 * Structured prompts for different AI-powered features
 */

import type {
  AIMessage,
  DashboardInsightsInput,
  RiskEventSummaryInput,
  SupplierSummaryInput,
} from './types';

/**
 * Generate supplier health summary prompt
 */
export function createSupplierSummaryPrompt(
  input: SupplierSummaryInput,
): AIMessage[] {
  const systemPrompt = `You are an expert supply chain risk analyst. Generate concise, actionable supplier health summaries for executives. Focus on risk factors, current status, and recommended actions. Keep responses under 150 words.`;

  const userPrompt = `Analyze this supplier and provide a health summary:

**Supplier**: ${input.supplierName}
**Tier**: ${input.tier} (1=critical direct supplier, 2=secondary, 3=tertiary)
**Current Risk Score**: ${input.currentRiskScore}/100
**Status**: ${input.status}
**Country**: ${input.country}
${input.recentEvents?.length ? `**Recent Events**: ${input.recentEvents.join(', ')}` : ''}
${input.openIncidents ? `**Open Incidents**: ${input.openIncidents}` : ''}

Provide a brief health summary covering:
1. Overall risk assessment
2. Key concerns (if any)
3. Recommended actions (if score > 60)`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

/**
 * Generate risk event analysis prompt
 */
export function createRiskEventSummaryPrompt(
  input: RiskEventSummaryInput,
): AIMessage[] {
  const systemPrompt = `You are a supply chain risk intelligence analyst. Analyze risk events and provide clear, actionable insights about potential supply chain impacts. Keep responses under 200 words.`;

  const userPrompt = `Analyze this risk event:

**Type**: ${input.eventType}
**Severity**: ${input.severity}
**Title**: ${input.title}
**Description**: ${input.description}
**Affected Regions**: ${input.affectedRegions.join(', ')}
${input.impactedSuppliers ? `**Impacted Suppliers**: ${input.impactedSuppliers}` : ''}

Provide analysis covering:
1. Supply chain impact assessment
2. Likely affected industries/sectors
3. Recommended mitigation strategies
4. Timeline for resolution (if applicable)`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

/**
 * Generate dashboard insights prompt
 */
export function createDashboardInsightsPrompt(
  input: DashboardInsightsInput,
): AIMessage[] {
  const systemPrompt = `You are an AI-powered supply chain intelligence assistant. Analyze supply chain data and provide executive-level insights, trends, and recommendations. Be concise and actionable. Keep responses under 200 words.`;

  const topRisks =
    input.topRiskSuppliers.length > 0
      ? input.topRiskSuppliers
          .map((s) => `${s.name} (score: ${s.score})`)
          .slice(0, 5)
          .join(', ')
      : 'None';

  const recentEventsStr =
    input.recentEvents.length > 0
      ? input.recentEvents
          .map((e) => `${e.severity} ${e.type}: ${e.title}`)
          .slice(0, 3)
          .join(' | ')
      : 'No recent events';

  const userPrompt = `Analyze the current supply chain risk landscape:

**Overview**:
- Total Suppliers: ${input.totalSuppliers}
- At-Risk Suppliers: ${input.atRiskSuppliers} (${Math.round((input.atRiskSuppliers / Math.max(input.totalSuppliers, 1)) * 100)}%)
- Active Incidents: ${input.activeIncidents}

**Recent Risk Events**: ${recentEventsStr}

**Highest Risk Suppliers**: ${topRisks}

Provide insights covering:
1. Overall risk posture (improving/stable/deteriorating)
2. Key trends or patterns
3. Top 2-3 recommended actions
4. Any emerging risks to watch`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

/**
 * Generate alternative supplier recommendation prompt
 */
export function createAlternativeSupplierPrompt(
  disruptedSupplier: string,
  supplierCapabilities: string[],
  region: string,
): AIMessage[] {
  const systemPrompt = `You are a supply chain sourcing advisor. Provide strategic recommendations for finding alternative suppliers when disruptions occur.`;

  const userPrompt = `A supplier is disrupted. Recommend alternative sourcing strategy:

**Disrupted Supplier**: ${disruptedSupplier}
**Location**: ${region}
**Capabilities**: ${supplierCapabilities.join(', ')}

Provide recommendations for:
1. Geographic regions to consider for alternatives
2. Key qualification criteria
3. Risk diversification strategies
4. Timeline considerations`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

/**
 * Generate business impact analysis prompt
 */
export function createBusinessImpactPrompt(
  disruptions: Array<{
    supplier: string;
    type: string;
    financialImpact: number;
  }>,
): AIMessage[] {
  const systemPrompt = `You are a financial analyst specializing in supply chain risk. Analyze disruption costs and provide executive insights on business impact.`;

  const totalImpact = disruptions.reduce(
    (sum, d) => sum + d.financialImpact,
    0,
  );
  const disruptionList = disruptions
    .map(
      (d) =>
        `${d.supplier}: ${d.type} ($${d.financialImpact.toLocaleString()})`,
    )
    .join('\n');

  const userPrompt = `Analyze business impact from active disruptions:

**Total Financial Impact**: $${totalImpact.toLocaleString()}

**Active Disruptions**:
${disruptionList}

Provide analysis covering:
1. Cost distribution and primary drivers
2. Potential cascading effects
3. Risk mitigation priorities
4. Financial containment strategies`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}
