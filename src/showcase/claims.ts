export type EvidenceCategory = 'implemented capability' | 'reported live proof' | 'vendor-reported' | 'illustrative assumption' | 'validation pending'
export interface Claim { text: string; value?: number; category: EvidenceCategory; source: string; checkedAt: string }
const checkedAt = '2026-10-03'
export const claims = {
  price: { text: 'Jev 1.13 input price, USD per million tokens; output free', value: .042, category: 'vendor-reported', source: 'https://docs.typesafe.ai/models', checkedAt },
  typed: { text: 'Jev returns typed decisions; AQM combines them using code-controlled scoring.', category: 'vendor-reported', source: 'https://docs.typesafe.ai/introduction', checkedAt },
  confidence: { text: 'Typed answers can still be wrong. Confidence is not measured correctness; calibrate against human judgments.', category: 'vendor-reported', source: 'https://docs.typesafe.ai/confidence', checkedAt },
  limits: { text: 'Validate on representative content, including long transcripts and ambiguous cases.', category: 'vendor-reported', source: 'https://docs.typesafe.ai/model-jaggedness/jev-1.13', checkedAt },
  launch: { text: 'Vendor launch material describes fast structured decisions; this is not AQM throughput evidence.', category: 'vendor-reported', source: 'https://typesafe.ai/blog/introducing-system-one-models-and-jev', checkedAt },
  product: { text: 'Scheduled evaluation, conditional forms, transparent scoring, analytics/coverage, human review/calibration and alerts/governance.', category: 'implemented capability', source: 'Working prototype capability summary', checkedAt },
  live: { text: 'Unattended scheduled voice evaluation path. Prior validation evidence; this showcase pass does not independently revalidate it.', category: 'reported live proof', source: 'Prior voice validation evidence', checkedAt },
  pending: { text: 'Production scale, selected digital scenarios, live notification delivery and pilot outcomes.', category: 'validation pending', source: 'Pilot validation scope', checkedAt },
  preset: { text: '100,000 conversations/month; 50% selected; one form; one request per form; 8,000 total input tokens per request.', category: 'illustrative assumption', source: 'Showcase planning preset, not a measured bill', checkedAt },
} satisfies Record<string, Claim>
