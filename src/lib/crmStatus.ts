// Single source of truth for prospect statuses across the entire CRM

export type ProspectStatus = 
  | 'new'
  | 'review'
  | 'enriching'
  | 'enriched'
  | 'contacted'
  | 'interested'
  | 'proposal'
  | 'closed_won'
  | 'closed_lost'
  | 'not_viable'
  | 'on_hold';

// Ordered by pipeline progression
export const PROSPECT_STATUSES: ProspectStatus[] = [
  'new',
  'review',
  'enriching',
  'enriched',
  'contacted',
  'interested',
  'proposal',
  'closed_won',
  'closed_lost',
  'not_viable',
  'on_hold'
];

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  'new': 'New',
  'review': 'Review',
  'enriching': 'Enriching',
  'enriched': 'Enriched',
  'contacted': 'Contacted',
  'interested': 'Interested',
  'proposal': 'Proposal',
  'closed_won': 'Closed Won',
  'closed_lost': 'Closed Lost',
  'not_viable': 'Not Viable',
  'on_hold': 'On Hold'
};

export const STATUS_BADGE_VARIANTS: Record<ProspectStatus, string> = {
  'new': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'enriching': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'enriched': 'bg-green-500/10 text-green-500 border-green-500/20',
  'contacted': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'interested': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'proposal': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  'closed_won': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'closed_lost': 'bg-red-500/10 text-red-500 border-red-500/20',
  'not_viable': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  'on_hold': 'bg-slate-500/10 text-slate-500 border-slate-500/20'
};

export const STATUS_DISPLAY_ORDER: Record<ProspectStatus, number> = {
  'new': 1,
  'review': 2,
  'enriching': 3,
  'enriched': 4,
  'contacted': 5,
  'interested': 6,
  'proposal': 7,
  'closed_won': 8,
  'closed_lost': 9,
  'not_viable': 10,
  'on_hold': 11
};

// Map legacy statuses to current ones
export const LEGACY_STATUS_MAP: Record<string, ProspectStatus> = {
  'qualified': 'interested'
};

// Normalize status on read
export const normalizeStatus = (status: string): ProspectStatus => {
  const normalized = LEGACY_STATUS_MAP[status] || status;
  return normalized as ProspectStatus;
};
