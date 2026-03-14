import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';

const querySchema = z.object({
  supplier_id: z.string().uuid(),
  region_ids: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
        : [],
    )
    .refine(
      (value) =>
        value.length === 0 ||
        value.every((id) => z.string().uuid().safeParse(id).success),
      { message: 'region_ids must be a comma-separated list of UUIDs' },
    ),
  limit: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : 5))
    .refine((value) => Number.isFinite(value) && value > 0 && value <= 20, {
      message: 'limit must be between 1 and 20',
    }),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const parsed = querySchema.parse({
      supplier_id: url.searchParams.get('supplier_id'),
      region_ids: url.searchParams.get('region_ids') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    });

    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 403 },
      );
    }

    const { data, error } = await supabase.rpc('find_alternative_suppliers', {
      p_org_id: membership.organization_id,
      p_supplier_id: parsed.supplier_id,
      p_region_ids: parsed.region_ids.length > 0 ? parsed.region_ids : null,
      p_limit: parsed.limit,
    });

    if (error) {
      logger.error({ error }, 'Alternative supplier match failed');
      return NextResponse.json(
        { error: 'Failed to fetch alternative suppliers' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      alternatives: data ?? [],
    });
  } catch (error) {
    logger.error({ error }, 'Alternative supplier API error');

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
