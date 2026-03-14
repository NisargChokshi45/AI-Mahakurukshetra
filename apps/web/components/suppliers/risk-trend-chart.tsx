'use client';

import { useMemo } from 'react';

type RiskScorePoint = {
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

type RiskTrendChartProps = {
  scores: RiskScorePoint[];
  height?: number;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      return 'Just now';
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getRiskColor(score: number): string {
  if (score >= 80) return '#dc2626'; // red-600
  if (score >= 70) return '#f59e0b'; // amber-500
  if (score >= 50) return '#eab308'; // yellow-500
  return '#10b981'; // emerald-500
}

function getRiskLabel(score: number): string {
  if (score >= 80) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Elevated';
  return 'Low';
}

export function RiskTrendChart({ scores, height = 200 }: RiskTrendChartProps) {
  const chartData = useMemo(() => {
    if (scores.length === 0) {
      return null;
    }

    // Sort by date ascending
    const sortedScores = [...scores].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    const width = 600;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Scale for scores (0-100)
    const maxScore = 100;
    const minScore = 0;

    // Calculate points for the composite score line
    const points = sortedScores.map((score, index) => {
      const x = padding.left + (index / (sortedScores.length - 1)) * chartWidth;
      const y =
        padding.top +
        chartHeight -
        ((score.composite_score - minScore) / (maxScore - minScore)) *
          chartHeight;
      return { x, y, score };
    });

    // Create path for the line
    const linePath = points
      .map((point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${point.x} ${point.y}`;
      })
      .join(' ');

    // Create area fill path
    const areaPath =
      linePath +
      ` L ${points[points.length - 1].x} ${padding.top + chartHeight}` +
      ` L ${points[0].x} ${padding.top + chartHeight} Z`;

    // Y-axis labels
    const yAxisLabels = [0, 25, 50, 75, 100];

    return {
      width,
      height,
      padding,
      chartWidth,
      chartHeight,
      points,
      linePath,
      areaPath,
      yAxisLabels,
      sortedScores,
      latestScore: sortedScores[sortedScores.length - 1],
      firstScore: sortedScores[0],
    };
  }, [scores, height]);

  if (!chartData || scores.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-500">
        No historical risk score data available yet. Scores will appear here
        after the first risk assessment run.
      </div>
    );
  }

  const { latestScore, firstScore } = chartData;
  const scoreDelta = latestScore.composite_score - firstScore.composite_score;
  const trendDirection =
    scoreDelta > 0 ? 'up' : scoreDelta < 0 ? 'down' : 'stable';
  const trendColor =
    trendDirection === 'up'
      ? 'text-red-600'
      : trendDirection === 'down'
        ? 'text-emerald-600'
        : 'text-slate-600';

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-medium text-slate-500">Current Risk</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-slate-950">
              {Math.round(latestScore.composite_score)}
            </p>
            <span
              className="text-xs font-semibold uppercase"
              style={{ color: getRiskColor(latestScore.composite_score) }}
            >
              {getRiskLabel(latestScore.composite_score)}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-medium text-slate-500">Trend</p>
          <p className={`mt-1 text-2xl font-semibold ${trendColor}`}>
            {trendDirection === 'stable'
              ? '→'
              : trendDirection === 'up'
                ? '↑'
                : '↓'}{' '}
            {Math.abs(scoreDelta).toFixed(0)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-medium text-slate-500">Data Points</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">
            {scores.length}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto rounded-[22px] border border-slate-200 bg-white p-4">
        <svg
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          className="w-full"
          style={{ minWidth: '500px' }}
        >
          {/* Grid lines */}
          {chartData.yAxisLabels.map((label) => {
            const y =
              chartData.padding.top +
              chartData.chartHeight -
              (label / 100) * chartData.chartHeight;
            return (
              <g key={label}>
                <line
                  x1={chartData.padding.left}
                  y1={y}
                  x2={chartData.padding.left + chartData.chartWidth}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={chartData.padding.left - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-slate-400 text-xs"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Risk zones background */}
          <defs>
            <linearGradient id="riskGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.1" />
              <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d={chartData.areaPath}
            fill="url(#riskGradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={chartData.linePath}
            fill="none"
            stroke={getRiskColor(latestScore.composite_score)}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {chartData.points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="white"
                stroke={getRiskColor(point.score.composite_score)}
                strokeWidth="2"
              />
              <title>
                {formatDate(point.score.created_at)}:{' '}
                {Math.round(point.score.composite_score)}
                {point.score.score_reason
                  ? ` - ${point.score.score_reason}`
                  : ''}
              </title>
            </g>
          ))}

          {/* X-axis labels */}
          {chartData.points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={chartData.padding.top + chartData.chartHeight + 20}
              textAnchor="middle"
              className="fill-slate-500 text-xs"
            >
              {formatDate(point.score.created_at)}
            </text>
          ))}
        </svg>
      </div>

      {/* Latest Event Context */}
      {latestScore.score_reason && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-medium text-slate-900">
            Latest assessment context
          </p>
          <p className="mt-1">{latestScore.score_reason}</p>
        </div>
      )}
    </div>
  );
}
