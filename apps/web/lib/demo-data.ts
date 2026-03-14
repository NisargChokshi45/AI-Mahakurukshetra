export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type WorkflowStatus =
  | 'watchlist'
  | 'stable'
  | 'active'
  | 'new'
  | 'investigating'
  | 'mitigating'
  | 'resolved'
  | 'monitoring'
  | 'draft'
  | 'scheduled'
  | 'completed';

export type RiskCategory = {
  label: string;
  score: number;
  delta: string;
};

export type Supplier = {
  id: string;
  name: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  region: string;
  country: string;
  riskScore: number;
  status: 'watchlist' | 'stable' | 'monitoring';
  primaryContact: string;
  activeAlerts: number;
  openIncidents: number;
  lastAssessment: string;
  leadTimeDays: number;
  resilienceScore: number;
  summary: string;
  categories: RiskCategory[];
};

export type Alert = {
  id: string;
  title: string;
  supplierId: string;
  severity: Severity;
  createdAt: string;
  type: string;
  response: string;
};

export type RiskEvent = {
  id: string;
  title: string;
  type: string;
  region: string;
  severity: Severity;
  status: 'active' | 'monitoring' | 'resolved';
  date: string;
  affectedSupplierIds: string[];
  summary: string;
};

export type Incident = {
  id: string;
  title: string;
  severity: Severity;
  status: 'new' | 'investigating' | 'mitigating' | 'resolved';
  owner: string;
  supplierId: string;
  linkedRiskEventId: string;
  createdAt: string;
  eta: string;
  summary: string;
  checklist: Array<{
    label: string;
    done: boolean;
  }>;
  timeline: Array<{
    time: string;
    title: string;
    note: string;
  }>;
  mitigationPlans: string[];
};

export type Report = {
  id: string;
  title: string;
  type: 'Executive Summary' | 'Supplier Scorecard' | 'Regional Heatmap';
  status: 'draft' | 'scheduled' | 'completed';
  generatedAt: string;
  owner: string;
  scope: string;
};

export type Assessment = {
  id: string;
  supplierId: string;
  assessor: string;
  framework: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  dueDate: string;
  score: number;
  focus: string;
};

export type DependencyNode = {
  id: string;
  label: string;
  tier: 'Org' | 'Tier 1' | 'Tier 2' | 'Tier 3';
  region: string;
  riskScore: number;
  dependencyLabels: string[];
};

export const organization = {
  name: 'Helix Global Manufacturing',
  workspace: 'APAC Electronics',
  coverage: '42 monitored suppliers across 9 regions',
  responseWindow: 'Median response 3h 20m',
};

export const trendSeries = [
  {
    label: 'Supplier exposure',
    value: '18 high-risk suppliers',
    change: '+3 this week',
    values: [34, 38, 42, 39, 44, 46, 49],
  },
  {
    label: 'Critical alerts',
    value: '7 unresolved',
    change: '-2 since yesterday',
    values: [12, 11, 10, 9, 8, 8, 7],
  },
  {
    label: 'Mitigation coverage',
    value: '81% actioned',
    change: '+9% this month',
    values: [52, 57, 63, 69, 72, 78, 81],
  },
];

export const suppliers: Supplier[] = [
  {
    id: 'aurora-electronics',
    name: 'Aurora Electronics',
    tier: 'Tier 1',
    region: 'East Asia',
    country: 'Taiwan',
    riskScore: 84,
    status: 'watchlist',
    primaryContact: 'Mila Zhang',
    activeAlerts: 3,
    openIncidents: 1,
    lastAssessment: '2026-03-10',
    leadTimeDays: 19,
    resilienceScore: 68,
    summary:
      'Semiconductor packaging partner impacted by freight bottlenecks and elevated export-control chatter.',
    categories: [
      { label: 'Geopolitical', score: 88, delta: '+12' },
      { label: 'Operational', score: 82, delta: '+8' },
      { label: 'Delivery', score: 79, delta: '+5' },
      { label: 'Compliance', score: 65, delta: '+2' },
    ],
  },
  {
    id: 'delta-forge',
    name: 'Delta Forge',
    tier: 'Tier 2',
    region: 'North America',
    country: 'Mexico',
    riskScore: 78,
    status: 'monitoring',
    primaryContact: 'Rafael Ortiz',
    activeAlerts: 2,
    openIncidents: 0,
    lastAssessment: '2026-03-08',
    leadTimeDays: 27,
    resilienceScore: 72,
    summary:
      'Precision metal fabricator seeing intermittent labor disruption and customs delays.',
    categories: [
      { label: 'Operational', score: 83, delta: '+7' },
      { label: 'Delivery', score: 81, delta: '+10' },
      { label: 'Financial', score: 68, delta: '+2' },
      { label: 'Compliance', score: 59, delta: '+1' },
    ],
  },
  {
    id: 'northwind-polymers',
    name: 'Northwind Polymers',
    tier: 'Tier 1',
    region: 'Europe',
    country: 'Germany',
    riskScore: 71,
    status: 'monitoring',
    primaryContact: 'Greta Weiss',
    activeAlerts: 1,
    openIncidents: 1,
    lastAssessment: '2026-03-11',
    leadTimeDays: 14,
    resilienceScore: 75,
    summary:
      'Resins supplier facing energy-cost volatility and a rising quality defect trend.',
    categories: [
      { label: 'Financial', score: 76, delta: '+6' },
      { label: 'Operational', score: 74, delta: '+4' },
      { label: 'Quality', score: 70, delta: '+9' },
      { label: 'Geopolitical', score: 58, delta: '+1' },
    ],
  },
  {
    id: 'summit-logistics',
    name: 'Summit Logistics',
    tier: 'Tier 2',
    region: 'South Asia',
    country: 'India',
    riskScore: 67,
    status: 'stable',
    primaryContact: 'Priya Nair',
    activeAlerts: 1,
    openIncidents: 0,
    lastAssessment: '2026-03-06',
    leadTimeDays: 11,
    resilienceScore: 80,
    summary:
      'Key distribution partner with improved continuity plan coverage but weather sensitivity remains.',
    categories: [
      { label: 'Natural disaster', score: 75, delta: '+11' },
      { label: 'Delivery', score: 63, delta: '-2' },
      { label: 'Operational', score: 58, delta: '-1' },
      { label: 'Compliance', score: 46, delta: '0' },
    ],
  },
  {
    id: 'blue-ridge-minerals',
    name: 'Blue Ridge Minerals',
    tier: 'Tier 3',
    region: 'Africa',
    country: 'South Africa',
    riskScore: 62,
    status: 'stable',
    primaryContact: 'Noah Mbeki',
    activeAlerts: 0,
    openIncidents: 0,
    lastAssessment: '2026-02-28',
    leadTimeDays: 33,
    resilienceScore: 74,
    summary:
      'Rare earth input supplier with stable output but limited secondary sourcing options.',
    categories: [
      { label: 'Geopolitical', score: 69, delta: '+3' },
      { label: 'Financial', score: 61, delta: '+1' },
      { label: 'Operational', score: 57, delta: '-2' },
      { label: 'ESG', score: 66, delta: '+4' },
    ],
  },
  {
    id: 'solstice-packaging',
    name: 'Solstice Packaging',
    tier: 'Tier 1',
    region: 'North America',
    country: 'United States',
    riskScore: 44,
    status: 'stable',
    primaryContact: 'Lena Brooks',
    activeAlerts: 0,
    openIncidents: 0,
    lastAssessment: '2026-03-01',
    leadTimeDays: 9,
    resilienceScore: 88,
    summary:
      'Packaging supplier with strong continuity posture and short lead time buffers.',
    categories: [
      { label: 'Operational', score: 39, delta: '-4' },
      { label: 'Delivery', score: 42, delta: '-3' },
      { label: 'Financial', score: 47, delta: '-1' },
      { label: 'Compliance', score: 33, delta: '0' },
    ],
  },
];

export const alerts: Alert[] = [
  {
    id: 'alert-001',
    title: 'Export control advisory updated for semiconductor packaging',
    supplierId: 'aurora-electronics',
    severity: 'critical',
    createdAt: '08:20 IST',
    type: 'Regulatory',
    response: 'Escalated to risk manager',
  },
  {
    id: 'alert-002',
    title: 'Customs delay trend exceeds 20% threshold',
    supplierId: 'delta-forge',
    severity: 'high',
    createdAt: '09:05 IST',
    type: 'Delivery',
    response: 'Review alternate routing',
  },
  {
    id: 'alert-003',
    title: 'Port congestion extends lead time estimate by 4 days',
    supplierId: 'aurora-electronics',
    severity: 'high',
    createdAt: '10:10 IST',
    type: 'Logistics',
    response: 'Ops war room opened',
  },
  {
    id: 'alert-004',
    title: 'Quality escapes trending up in polymer lots',
    supplierId: 'northwind-polymers',
    severity: 'medium',
    createdAt: '11:40 IST',
    type: 'Quality',
    response: 'Assessment scheduled',
  },
  {
    id: 'alert-005',
    title: 'Flood advisory near Pune distribution lane',
    supplierId: 'summit-logistics',
    severity: 'medium',
    createdAt: '12:15 IST',
    type: 'Weather',
    response: 'Monitoring only',
  },
];

export const riskEvents: RiskEvent[] = [
  {
    id: 'risk-001',
    title: 'Kaohsiung port throughput disruption',
    type: 'Logistics',
    region: 'East Asia',
    severity: 'critical',
    status: 'active',
    date: '2026-03-14',
    affectedSupplierIds: ['aurora-electronics'],
    summary:
      'Port congestion and inspection backlog are extending outbound semiconductor shipments by 72 hours.',
  },
  {
    id: 'risk-002',
    title: 'Northern Mexico labor action',
    type: 'Operational',
    region: 'North America',
    severity: 'high',
    status: 'monitoring',
    date: '2026-03-13',
    affectedSupplierIds: ['delta-forge'],
    summary:
      'Intermittent line stoppages at contract metal processing facilities risk component shortages next week.',
  },
  {
    id: 'risk-003',
    title: 'Energy price spike for polymer processing',
    type: 'Financial',
    region: 'Europe',
    severity: 'medium',
    status: 'active',
    date: '2026-03-12',
    affectedSupplierIds: ['northwind-polymers'],
    summary:
      'Sustained cost pressure may affect pricing and on-time quality checks across two production lines.',
  },
  {
    id: 'risk-004',
    title: 'Monsoon flood warning on west-coast distribution corridor',
    type: 'Natural disaster',
    region: 'South Asia',
    severity: 'medium',
    status: 'monitoring',
    date: '2026-03-14',
    affectedSupplierIds: ['summit-logistics'],
    summary:
      'Flood warning issued for a route serving three downstream assembly sites with moderate inventory cover.',
  },
  {
    id: 'risk-005',
    title: 'Rare earth permit review extended',
    type: 'Regulatory',
    region: 'Africa',
    severity: 'low',
    status: 'resolved',
    date: '2026-03-09',
    affectedSupplierIds: ['blue-ridge-minerals'],
    summary:
      'Permit extension cleared after regulator review; watch item remains for secondary sourcing concentration.',
  },
];

export const incidents: Incident[] = [
  {
    id: 'inc-401',
    title: 'Aurora packaging lane delay',
    severity: 'critical',
    status: 'investigating',
    owner: 'Arjun Rao',
    supplierId: 'aurora-electronics',
    linkedRiskEventId: 'risk-001',
    createdAt: '2026-03-14 08:45',
    eta: 'Mitigation update in 2h',
    summary:
      'Critical chip packaging inventory may fall below safety stock in 6 days if shipments slip beyond 72 hours.',
    checklist: [
      { label: 'Confirm current buffer stock at all APAC plants', done: true },
      {
        label: 'Lock alternate freight capacity for next two departures',
        done: true,
      },
      { label: 'Approve expedited customs broker option', done: false },
      { label: 'Brief executive incident channel', done: false },
    ],
    timeline: [
      {
        time: '08:45',
        title: 'Incident opened',
        note: 'Alert threshold breached after port backlog and customs advisories aligned.',
      },
      {
        time: '09:30',
        title: 'Ops war room assembled',
        note: 'Procurement, logistics, and risk teams aligned on 3 possible reroute options.',
      },
      {
        time: '10:20',
        title: 'Inventory coverage recalculated',
        note: 'Shenzhen and Pune plants have lowest buffer, requiring prioritization.',
      },
    ],
    mitigationPlans: [
      'Reallocate safety stock from Osaka to Pune',
      'Expedite two partial loads by air for top-priority assemblies',
    ],
  },
  {
    id: 'inc-402',
    title: 'Northwind polymer quality review',
    severity: 'high',
    status: 'mitigating',
    owner: 'Meera Khanna',
    supplierId: 'northwind-polymers',
    linkedRiskEventId: 'risk-003',
    createdAt: '2026-03-13 14:10',
    eta: 'Supplier CAPA due tomorrow',
    summary:
      'Quality variation threatens casings for two flagship devices. Alternate resin lots are being validated.',
    checklist: [
      { label: 'Hold suspect lots from release', done: true },
      { label: 'Issue supplier corrective action request', done: true },
      { label: 'Validate alternate resin mix at pilot scale', done: false },
      { label: 'Update customer promise dates if needed', done: false },
    ],
    timeline: [
      {
        time: '14:10',
        title: 'Issue triaged',
        note: 'Defect trend exceeded acceptable threshold on two consecutive shifts.',
      },
      {
        time: '16:25',
        title: 'Containment started',
        note: 'Warehouse hold applied to 4 inbound lots pending inspection.',
      },
    ],
    mitigationPlans: [
      'Shift one product family to backup resin blend',
      'Increase incoming lot sampling to 20% until CAPA closes',
    ],
  },
  {
    id: 'inc-403',
    title: 'Mexico customs documentation gap',
    severity: 'medium',
    status: 'new',
    owner: 'Sofia Patel',
    supplierId: 'delta-forge',
    linkedRiskEventId: 'risk-002',
    createdAt: '2026-03-14 11:25',
    eta: 'Awaiting broker confirmation',
    summary:
      'Outbound forged components are delayed pending document correction for two cross-border lanes.',
    checklist: [
      { label: 'Verify HS code mapping with broker', done: false },
      { label: 'Confirm delivery impact on Monterrey line', done: false },
      { label: 'Escalate alternate carrier request', done: false },
    ],
    timeline: [
      {
        time: '11:25',
        title: 'Incident opened',
        note: 'Delay signal came from customs queue exception report.',
      },
    ],
    mitigationPlans: ['Prepare backup broker package for repeat shipments'],
  },
  {
    id: 'inc-404',
    title: 'Western corridor weather watch',
    severity: 'low',
    status: 'resolved',
    owner: 'Karan Dutta',
    supplierId: 'summit-logistics',
    linkedRiskEventId: 'risk-004',
    createdAt: '2026-03-11 07:40',
    eta: 'Closed',
    summary:
      'Flood routing contingency was activated and all in-transit loads were rerouted without customer impact.',
    checklist: [
      { label: 'Trigger route diversion SOP', done: true },
      { label: 'Confirm truck telemetry and ETA', done: true },
      { label: 'Close incident and archive notes', done: true },
    ],
    timeline: [
      {
        time: '07:40',
        title: 'Risk acknowledged',
        note: 'Transport control tower initiated contingency routing within 30 minutes.',
      },
      {
        time: '12:10',
        title: 'Resolved',
        note: 'No SLA breach recorded after detour completed.',
      },
    ],
    mitigationPlans: [
      'Keep alternate route pre-approved through monsoon season',
    ],
  },
];

export const reports: Report[] = [
  {
    id: 'rep-301',
    title: 'Weekly executive disruption summary',
    type: 'Executive Summary',
    status: 'completed',
    generatedAt: '2026-03-14 07:30',
    owner: 'Arjun Rao',
    scope: 'Global operations',
  },
  {
    id: 'rep-302',
    title: 'Aurora Electronics supplier scorecard',
    type: 'Supplier Scorecard',
    status: 'draft',
    generatedAt: '2026-03-14 09:10',
    owner: 'Meera Khanna',
    scope: 'Supplier deep-dive',
  },
  {
    id: 'rep-303',
    title: 'APAC regional heatmap',
    type: 'Regional Heatmap',
    status: 'scheduled',
    generatedAt: '2026-03-15 06:00',
    owner: 'Sofia Patel',
    scope: 'East Asia + South Asia',
  },
];

export const assessments: Assessment[] = [
  {
    id: 'assess-101',
    supplierId: 'aurora-electronics',
    assessor: 'Priyanka Sen',
    framework: 'Operational resilience review',
    status: 'completed',
    dueDate: '2026-03-10',
    score: 68,
    focus: 'Freight resilience and single-port dependency',
  },
  {
    id: 'assess-102',
    supplierId: 'northwind-polymers',
    assessor: 'Noah James',
    framework: 'Quality assurance audit',
    status: 'in_progress',
    dueDate: '2026-03-16',
    score: 54,
    focus: 'Defect containment and CAPA maturity',
  },
  {
    id: 'assess-103',
    supplierId: 'delta-forge',
    assessor: 'Anaya Shah',
    framework: 'Cross-border continuity check',
    status: 'scheduled',
    dueDate: '2026-03-18',
    score: 61,
    focus: 'Customs readiness and document controls',
  },
  {
    id: 'assess-104',
    supplierId: 'solstice-packaging',
    assessor: 'Lena Morris',
    framework: 'Supplier resilience benchmark',
    status: 'completed',
    dueDate: '2026-02-28',
    score: 88,
    focus: 'Continuity planning and dual-source maturity',
  },
];

export const dependencyMap: DependencyNode[] = [
  {
    id: 'org-helix',
    label: 'Helix Global Manufacturing',
    tier: 'Org',
    region: 'Global',
    riskScore: 58,
    dependencyLabels: [
      'Aurora Electronics',
      'Northwind Polymers',
      'Solstice Packaging',
    ],
  },
  {
    id: 'dep-aurora',
    label: 'Aurora Electronics',
    tier: 'Tier 1',
    region: 'East Asia',
    riskScore: 84,
    dependencyLabels: ['Blue Ridge Minerals'],
  },
  {
    id: 'dep-northwind',
    label: 'Northwind Polymers',
    tier: 'Tier 1',
    region: 'Europe',
    riskScore: 71,
    dependencyLabels: ['Delta Forge'],
  },
  {
    id: 'dep-solstice',
    label: 'Solstice Packaging',
    tier: 'Tier 1',
    region: 'North America',
    riskScore: 44,
    dependencyLabels: ['Summit Logistics'],
  },
  {
    id: 'dep-delta',
    label: 'Delta Forge',
    tier: 'Tier 2',
    region: 'North America',
    riskScore: 78,
    dependencyLabels: ['Blue Ridge Minerals'],
  },
  {
    id: 'dep-summit',
    label: 'Summit Logistics',
    tier: 'Tier 2',
    region: 'South Asia',
    riskScore: 67,
    dependencyLabels: [],
  },
  {
    id: 'dep-blue-ridge',
    label: 'Blue Ridge Minerals',
    tier: 'Tier 3',
    region: 'Africa',
    riskScore: 62,
    dependencyLabels: [],
  },
];

export const dashboardMetrics = [
  {
    label: 'Critical alerts',
    value: `${alerts.filter((alert) => alert.severity === 'critical').length}`,
    detail: 'Needs leadership visibility',
  },
  {
    label: 'Open incidents',
    value: `${incidents.filter((incident) => incident.status !== 'resolved').length}`,
    detail: 'Across procurement and risk',
  },
  {
    label: 'Suppliers on watch',
    value: `${suppliers.filter((supplier) => supplier.riskScore >= 70).length}`,
    detail: 'Score above intervention threshold',
  },
  {
    label: 'Assessments due',
    value: `${assessments.filter((assessment) => assessment.status !== 'completed').length}`,
    detail: 'Next 7 days',
  },
];

export const topRiskSuppliers = [...suppliers]
  .sort((left, right) => right.riskScore - left.riskScore)
  .slice(0, 5);

export function getSupplierById(id: string) {
  return suppliers.find((supplier) => supplier.id === id) ?? null;
}

export function getIncidentById(id: string) {
  return incidents.find((incident) => incident.id === id) ?? null;
}

export function getRiskEventById(id: string) {
  return riskEvents.find((event) => event.id === id) ?? null;
}

export function getSupplierName(supplierId: string) {
  return getSupplierById(supplierId)?.name ?? 'Unknown supplier';
}

export function getSupplierAlerts(supplierId: string) {
  return alerts.filter((alert) => alert.supplierId === supplierId);
}

export function getSupplierIncidents(supplierId: string) {
  return incidents.filter((incident) => incident.supplierId === supplierId);
}

export function getSupplierRiskEvents(supplierId: string) {
  return riskEvents.filter((event) =>
    event.affectedSupplierIds.includes(supplierId),
  );
}

export function formatStatusLabel(status: string) {
  return status.replaceAll('_', ' ');
}
