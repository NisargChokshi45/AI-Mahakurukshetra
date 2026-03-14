/**
 * AI Settings API
 * Manage AI provider configuration for organizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';

const settingsSchema = z.object({
  provider: z.enum(['claude', 'gemini', 'openai', 'grok']),
  apiKey: z.string().min(1).optional(),
  model: z.string().optional(),
});

/**
 * GET - Retrieve AI settings for the organization
 */
export async function GET(request: NextRequest) {
  const requestLog = startRequestLog({
    method: request.method,
    pathname: request.nextUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });

  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logRequestResponse(requestLog, {
        status: 401,
        level: 'warn',
        message: 'Unauthorized AI settings request.',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's org (only owners/admins can access AI settings)
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      logRequestResponse(requestLog, {
        status: 403,
        level: 'warn',
        message: 'Insufficient permissions for AI settings.',
        metadata: { user_id: user.id },
      });
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    const orgId = membership.organization_id;

    // Get AI settings
    const { data: settings } = await supabase
      .from('ai_settings')
      .select('provider, model, enabled')
      .eq('organization_id', orgId)
      .eq('enabled', true)
      .single();

    if (!settings) {
      logRequestResponse(requestLog, {
        status: 200,
        message: 'No AI settings found for organization.',
        metadata: { user_id: user.id, org_id: orgId },
      });
      return NextResponse.json({ settings: null });
    }

    logRequestResponse(requestLog, {
      status: 200,
      message: 'AI settings retrieved successfully.',
      metadata: {
        user_id: user.id,
        org_id: orgId,
        provider: settings.provider,
      },
    });

    return NextResponse.json({
      settings: {
        provider: settings.provider,
        model: settings.model,
        hasApiKey: true, // Never expose the actual key
      },
    });
  } catch (error) {
    logRequestResponse(requestLog, {
      status: 500,
      level: 'error',
      message: 'Get AI settings error.',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST - Update AI settings for the organization
 */
export async function POST(request: NextRequest) {
  const requestLog = startRequestLog({
    method: request.method,
    pathname: request.nextUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });

  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logRequestResponse(requestLog, {
        status: 401,
        level: 'warn',
        message: 'Unauthorized AI settings update request.',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const { provider, apiKey, model } = settingsSchema.parse(body);

    // Get user's org (only owners/admins can modify AI settings)
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      logRequestResponse(requestLog, {
        status: 403,
        level: 'warn',
        message: 'Insufficient permissions for AI settings update.',
        metadata: { user_id: user.id },
      });
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    const orgId = membership.organization_id;

    // Check if settings already exist
    const { data: existing } = await supabase
      .from('ai_settings')
      .select('id')
      .eq('organization_id', orgId)
      .eq('enabled', true)
      .single();

    if (existing) {
      // Update existing settings
      const updateData: Record<string, string | boolean> = {
        provider,
        enabled: true,
      };

      if (apiKey) {
        updateData.api_key = apiKey;
      }

      if (model) {
        updateData.model = model;
      }

      const { error: updateError } = await supabase
        .from('ai_settings')
        .update(updateData)
        .eq('id', existing.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new settings
      if (!apiKey) {
        logRequestResponse(requestLog, {
          status: 400,
          level: 'warn',
          message: 'API key required for initial configuration.',
          metadata: { user_id: user.id, org_id: orgId },
        });
        return NextResponse.json(
          { error: 'API key is required for initial configuration' },
          { status: 400 },
        );
      }

      const { error: insertError } = await supabase.from('ai_settings').insert({
        organization_id: orgId,
        provider,
        api_key: apiKey,
        model: model || null,
        enabled: true,
      });

      if (insertError) {
        throw insertError;
      }
    }

    logRequestResponse(requestLog, {
      status: 200,
      message: 'AI settings updated successfully.',
      metadata: { user_id: user.id, org_id: orgId, provider },
    });

    return NextResponse.json({
      success: true,
      message: 'AI settings updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logRequestResponse(requestLog, {
        status: 400,
        level: 'warn',
        message: 'Invalid request.',
        metadata: {
          error: error.issues,
        },
      });
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 },
      );
    }

    logRequestResponse(requestLog, {
      status: 500,
      level: 'error',
      message: 'Update AI settings error.',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
