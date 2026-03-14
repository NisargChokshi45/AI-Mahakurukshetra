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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderReportPdfPreview(params: {
  report: (typeof reports)[number];
  generatedAt: string;
  organizationId: string;
  organizationName: string;
}) {
  const { report, generatedAt, organizationId, organizationName } = params;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(report.title)} - PDF Preview</title>
    <style>
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: "Inter", "Segoe UI", system-ui, sans-serif;
        background: #f8fafc;
        color: #0f172a;
      }
      main {
        max-width: 920px;
        margin: 32px auto 48px;
        background: #ffffff;
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 24px 60px -48px rgba(15, 23, 42, 0.6);
      }
      header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 20px;
      }
      h1 {
        margin: 0 0 6px;
        font-size: 28px;
        letter-spacing: -0.02em;
      }
      .meta {
        font-size: 12px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-weight: 600;
      }
      .pill {
        background: #e0f2fe;
        color: #0c4a6e;
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.16em;
      }
      .summary {
        margin-top: 24px;
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .summary-card {
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 16px;
        background: #f8fafc;
      }
      .summary-card h3 {
        margin: 0 0 10px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: #64748b;
      }
      .summary-card p {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
      .section {
        margin-top: 28px;
      }
      .section h2 {
        margin: 0 0 12px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: #475569;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #e2e8f0;
        font-size: 14px;
      }
      .row:last-child {
        border-bottom: none;
      }
      .footer {
        margin-top: 28px;
        font-size: 12px;
        color: #64748b;
        line-height: 1.6;
      }
      .actions {
        margin-top: 28px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .button {
        border: none;
        border-radius: 999px;
        padding: 10px 18px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        background: #0f172a;
        color: #ffffff;
      }
      .button.secondary {
        background: #e2e8f0;
        color: #0f172a;
      }
      @media print {
        body {
          background: #ffffff;
        }
        main {
          margin: 0;
          box-shadow: none;
          border-radius: 0;
        }
        .actions {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div>
          <div class="meta">Report Preview</div>
          <h1>${escapeHtml(report.title)}</h1>
          <div style="font-size: 14px; color: #475569;">
            ${escapeHtml(report.type)} · #${escapeHtml(report.id)}
          </div>
        </div>
        <div class="pill">${escapeHtml(report.status)}</div>
      </header>

      <section class="summary">
        <div class="summary-card">
          <h3>Owner</h3>
          <p>${escapeHtml(report.owner)}</p>
        </div>
        <div class="summary-card">
          <h3>Scope</h3>
          <p>${escapeHtml(report.scope)}</p>
        </div>
        <div class="summary-card">
          <h3>Generated</h3>
          <p>${escapeHtml(report.generatedAt)}</p>
        </div>
      </section>

      <section class="section">
        <h2>Executive Summary</h2>
        <div class="row">
          <div>At-risk suppliers</div>
          <strong>18</strong>
        </div>
        <div class="row">
          <div>Open incidents</div>
          <strong>7</strong>
        </div>
        <div class="row">
          <div>Regional exposure zones</div>
          <strong>3</strong>
        </div>
      </section>

      <section class="section">
        <h2>Export Context</h2>
        <div class="row">
          <div>Organization</div>
          <strong>${escapeHtml(organizationName)}</strong>
        </div>
        <div class="row">
          <div>Organization ID</div>
          <strong>${escapeHtml(organizationId)}</strong>
        </div>
        <div class="row">
          <div>Export generated at</div>
          <strong>${escapeHtml(generatedAt)}</strong>
        </div>
      </section>

      <div class="actions">
        <button class="button" onclick="window.print()">Print / Save as PDF</button>
        <button class="button secondary" onclick="window.close()">Close preview</button>
      </div>

      <p class="footer">
        This preview uses demo report data to validate PDF workflows before live rendering is wired.
      </p>
    </main>
    <script>
      if (window && typeof window.print === 'function') {
        window.setTimeout(() => window.print(), 300);
      }
    </script>
  </body>
</html>`;
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
  const format = request.nextUrl.searchParams.get('format') ?? 'csv';
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

  if (format !== 'csv' && format !== 'pdf') {
    return respondJson(
      400,
      { error: 'Unsupported report export format.' },
      'warn',
    );
  }

  const nowIso = new Date().toISOString();

  if (format === 'pdf') {
    const html = renderReportPdfPreview({
      report,
      generatedAt: nowIso,
      organizationId: context.organization.organizationId,
      organizationName: context.organization.organizationName,
    });

    const response = new NextResponse(html, {
      status: 200,
      headers: {
        'cache-control': 'no-store, max-age=0',
        'content-type': 'text/html; charset=utf-8',
        'x-request-id': requestLog.requestId,
      },
    });

    logRequestResponse(requestLog, {
      status: 200,
      message: 'Report PDF preview generated.',
      metadata: {
        organization_id: context.organization.organizationId,
        report_id: report.id,
      },
    });

    return response;
  }
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
