import { NextRequest, NextResponse } from 'next/server';
import { reports } from '@/lib/demo-data';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';
import { getAuthContext } from '@/lib/auth/session';

function escapeCsvCell(value: string): string {
  const needsQuotes =
    value.includes(',') || value.includes('"') || value.includes('\n');
  const escaped = value.replaceAll('"', '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function toCsv(rows: string[][]): string {
  return rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
    .join('\n');
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestLog = startRequestLog({
    method: request.method,
    pathname: request.nextUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });

  const respondJson = (
    status: number,
    payload: Record<string, string>,
    level: 'error' | 'info' | 'warn' = 'info',
    message = 'Report export request handled.',
  ) => {
    const response = NextResponse.json(payload, { status });
    response.headers.set('x-request-id', requestLog.requestId);
    logRequestResponse(requestLog, { status, level, message });
    return response;
  };

  const context = await getAuthContext();
  if (!context) {
    return respondJson(401, { error: 'Authentication required.' }, 'warn');
  }

  if (!context.organization) {
    return respondJson(
      403,
      { error: 'Organization context is required to export reports.' },
      'warn',
    );
  }

  const reportId = request.nextUrl.searchParams.get('reportId');
  const selectedReport = reportId
    ? reports.find((report) => report.id === reportId)
    : undefined;
  const fallbackReport =
    reports.find((report) => report.status === 'completed') ?? reports[0];
  const report = selectedReport ?? fallbackReport;

  if (!report) {
    return respondJson(404, { error: 'No report data available.' }, 'warn');
  }

  if (reportId && !selectedReport) {
    return respondJson(404, { error: 'Report not found.' }, 'warn');
  }

  const nowIso = new Date().toISOString();
  const rows: string[][] = [
    ['report_id', report.id],
    ['report_title', report.title],
    ['report_type', report.type],
    ['report_status', report.status],
    ['report_scope', report.scope],
    ['report_owner', report.owner],
    ['report_generated_at', report.generatedAt],
    ['export_generated_at', nowIso],
    ['organization_id', context.organization.organizationId],
    ['organization_name', context.organization.organizationName],
    ['section', 'metric', 'value', 'detail'],
    [
      'summary',
      'at_risk_suppliers',
      '18',
      'Dummy preview metric for report download validation.',
    ],
    ['summary', 'open_incidents', '7', 'Includes new + investigating queues.'],
    [
      'summary',
      'regional_exposure_zones',
      '3',
      'East Asia, South Asia, and Europe clusters.',
    ],
    [
      'risk_driver',
      'freight_bottlenecks',
      '84',
      'Primary pressure on supplier lead-time reliability.',
    ],
    [
      'risk_driver',
      'export_control_volatility',
      '78',
      'Policy and customs volatility impacting throughput.',
    ],
    [
      'risk_driver',
      'weather_linked_delays',
      '65',
      'Seasonal disruptions affecting transit routes.',
    ],
    [
      'timeline',
      '07:40 IST',
      'watchlist_rebalance',
      'Risk watchlist rebalance published to procurement and operations.',
    ],
    [
      'timeline',
      '09:05 IST',
      'owner_assignment',
      'Aurora Electronics mitigation owner assigned with 24-hour SLA.',
    ],
    [
      'timeline',
      '11:20 IST',
      'contingency_review',
      'Regional contingency review scheduled with logistics leads.',
    ],
  ];

  const csv = `${toCsv(rows)}\n`;
  const filename = `${toSlug(report.title) || report.id}-${nowIso.slice(0, 10)}.csv`;

  const response = new NextResponse(csv, {
    status: 200,
    headers: {
      'cache-control': 'no-store',
      'content-disposition': `attachment; filename="${filename}"`,
      'content-type': 'text/csv; charset=utf-8',
      'x-request-id': requestLog.requestId,
    },
  });

  logRequestResponse(requestLog, {
    status: 200,
    message: 'Report CSV export generated.',
    metadata: {
      organization_id: context.organization.organizationId,
      report_id: report.id,
    },
  });

  return response;
}
