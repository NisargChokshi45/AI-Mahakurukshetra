'use server';

import { createClient } from '@/lib/supabase/server';
import { requireOrganizationContext } from '@/lib/auth/session';

export type RiskScoreHistory = {
  created_at: string;
  composite_score: number;
  financial_score: number;
  geopolitical_score: number;
  natural_disaster_score: number;
  operational_score: number;
  compliance_score: number;
  delivery_score: number;
  score_reason: string | null;
};

/**
 * Fetches historical risk scores for a supplier
 * Returns up to 30 most recent scores for trend visualization
 */
export async function getSupplierRiskHistory(
  supplierId: string,
): Promise<RiskScoreHistory[]> {
  const context = await requireOrganizationContext();
  const supabase = await createClient();

  // First, resolve the supplier ID from slug if needed
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('id')
    .eq('organization_id', context.organization.organizationId)
    .or(`id.eq.${supplierId},slug.eq.${supplierId}`)
    .maybeSingle();

  if (!supplier) {
    return [];
  }

  const { data, error } = await supabase
    .from('risk_scores')
    .select(
      'created_at, composite_score, financial_score, geopolitical_score, natural_disaster_score, operational_score, compliance_score, delivery_score, score_reason',
    )
    .eq('organization_id', context.organization.organizationId)
    .eq('supplier_id', supplier.id)
    .eq('target_type', 'supplier')
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Failed to fetch risk score history:', error);
    return [];
  }

  return (
    data?.map((row) => ({
      created_at: row.created_at,
      composite_score: Number(row.composite_score),
      financial_score: Number(row.financial_score),
      geopolitical_score: Number(row.geopolitical_score),
      natural_disaster_score: Number(row.natural_disaster_score),
      operational_score: Number(row.operational_score),
      compliance_score: Number(row.compliance_score),
      delivery_score: Number(row.delivery_score),
      score_reason: row.score_reason,
    })) ?? []
  );
}
