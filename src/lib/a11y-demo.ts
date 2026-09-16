/**
 * Browser excerpt of a11y Companion product contracts.
 * Source: packages/product-contracts/src/domain.ts and product-scenarios.json
 * Repository: marklearst/a11y-companion-widget
 * Commit: 52550254d699ac19f73226c7641a2c24a45736f6
 *
 * The readiness and contrast assessment functions below are copied unchanged.
 * Scenario data is a reduced excerpt of the committed fixtures. Contrast ratios
 * are recalculated from fixture colors because the saved ratios did not match
 * those colors. The Figma runtime and renderer are not included in this demo.
 */

export const AUDIT_KINDS = ["touch", "text", "tokens"] as const;

export type AuditKind = (typeof AUDIT_KINDS)[number];

export type CanvasRecordStatus =
  "action-required" | "review-remaining" | "in-progress" | "ready";

export type ContrastAssessment = {
  specimen: "Aa";
  grade: "AAA" | "AA" | "Large text only" | "Failed";
  passesAA: boolean;
  verdict: string;
  passMatrix: ContrastPassMatrixRow[];
};

export type ContrastPassMatrixRow = {
  id: "aa-normal" | "aa-large" | "aaa";
  label: string;
  threshold: string;
  pass: boolean;
};

const CONTRAST_CRITERIA = [
  { id: "aa-normal", label: "AA normal", threshold: 4.5 },
  { id: "aa-large", label: "AA large", threshold: 3 },
  { id: "aaa", label: "AAA", threshold: 7 },
] as const;

function buildContrastPassMatrix(ratio: number): ContrastPassMatrixRow[] {
  return CONTRAST_CRITERIA.map((criterion) => ({
    id: criterion.id,
    label: criterion.label,
    threshold: `≥ ${criterion.threshold}`,
    pass: ratio >= criterion.threshold,
  }));
}

/** Derives display and handoff meaning from the measured WCAG ratio. */
export function assessNormalTextContrast(ratio: number): ContrastAssessment {
  const passMatrix = buildContrastPassMatrix(ratio);

  if (ratio >= 7) {
    return {
      specimen: "Aa",
      grade: "AAA",
      passesAA: true,
      verdict: "Pass: AAA normal text",
      passMatrix,
    };
  }
  if (ratio >= 4.5) {
    return {
      specimen: "Aa",
      grade: "AA",
      passesAA: true,
      verdict: "Pass: AA normal and large text",
      passMatrix,
    };
  }
  if (ratio >= 3) {
    return {
      specimen: "Aa",
      grade: "Large text only",
      passesAA: false,
      verdict: "Pass: AA large text only",
      passMatrix,
    };
  }
  return {
    specimen: "Aa",
    grade: "Failed",
    passesAA: false,
    verdict: "Fail: below 3:1 for text",
    passMatrix,
  };
}

export type RecordReadinessInput = {
  failures: number;
  reviews: number;
  staleSignoffs: number;
  partialEvidence: boolean;
  missingAuditTypes: number;
  remainingChecks: number;
  remainingSignoffs: number;
  checklistComplete: boolean;
  signoffsComplete: boolean;
  passingContrast: boolean;
  contrastFails: boolean;
};

export type RecordReadiness = {
  status: CanvasRecordStatus;
  label: string;
  detail: string;
};

function plural(value: number, singular: string, pluralForm = `${singular}s`) {
  return `${value} ${value === 1 ? singular : pluralForm}`;
}

/**
 * Canonical Canvas Record status precedence shared by every renderer.
 * A renderer can add presentation, but it cannot reinterpret readiness.
 */
export function deriveRecordReadiness(
  input: RecordReadinessInput,
): RecordReadiness {
  if (input.failures > 0 || input.contrastFails) {
    const blockingIssues = input.failures + (input.contrastFails ? 1 : 0);
    return {
      status: "action-required",
      label: "Action required",
      detail: `${plural(blockingIssues, "blocking issue")} ${
        blockingIssues === 1 ? "needs" : "need"
      } a fix before handoff.`,
    };
  }

  if (
    input.reviews > 0 ||
    input.staleSignoffs > 0 ||
    input.partialEvidence ||
    input.missingAuditTypes > 0
  ) {
    if (input.partialEvidence) {
      return {
        status: "review-remaining",
        label: "Review required",
        detail:
          "Selection-only or capped evidence must be replaced before handoff.",
      };
    }

    if (input.missingAuditTypes > 0) {
      return {
        status: "review-remaining",
        label: "Review required",
        detail: `${input.missingAuditTypes} audit ${
          input.missingAuditTypes === 1 ? "type is" : "types are"
        } still missing.`,
      };
    }

    const unresolvedReviews = input.reviews + input.staleSignoffs;
    return {
      status: "review-remaining",
      label: "Review required",
      detail: `${plural(unresolvedReviews, "review item")} still ${
        unresolvedReviews === 1 ? "needs" : "need"
      } a decision.`,
    };
  }

  if (
    input.checklistComplete &&
    input.signoffsComplete &&
    input.passingContrast
  ) {
    return {
      status: "ready",
      label: "Ready for handoff",
      detail:
        "Checklist, evidence, sign-offs, and contrast are ready for handoff.",
    };
  }

  if (
    input.remainingChecks === 0 &&
    input.remainingSignoffs === 0 &&
    !input.passingContrast &&
    !input.contrastFails
  ) {
    return {
      status: "in-progress",
      label: "Review in progress",
      detail: "A supported contrast check is still missing.",
    };
  }

  return {
    status: "in-progress",
    label: "Review in progress",
    detail: `${plural(input.remainingChecks, "check")} and ${plural(
      input.remainingSignoffs,
      "section sign-off",
    )} remaining.`,
  };
}

export const A11Y_DEMO_SAMPLE_DATE = '2026-07-13T13:00:00.000Z'

export type A11yDemoScenarioId =
  | 'ready-for-handoff'
  | 'stale-signoff'
  | 'partial-node-scan'
  | 'contrast-failure-120'

type DemoEvidence = {
  kind: AuditKind
  label: string
  state: 'complete' | 'partial'
  scope: 'page' | 'selection'
  checked: number
  failed: number
  warned: number
  reviewed: number
  disclosure: string
}

export type A11yDemoScenario = {
  id: A11yDemoScenarioId
  label: string
  explanation: string
  widget: {
    totalChecks: number
    completedChecks: number
    totalSections: number
    signedSections: number
    staleSignoffs: number
    contrast: { text: string; background: string }
  }
  evidence: readonly DemoEvidence[]
}

const passingColors = { text: '#92400E', background: '#FEF3C7' }
const completeEvidence: readonly DemoEvidence[] = [
  { kind: 'touch', label: 'Touch targets', state: 'complete', scope: 'page', checked: 50, failed: 0, warned: 0, reviewed: 0, disclosure: '50 targets checked' },
  { kind: 'text', label: 'Text readability', state: 'complete', scope: 'page', checked: 41, failed: 0, warned: 0, reviewed: 0, disclosure: '41 text layers checked' },
  { kind: 'tokens', label: 'Token contrast', state: 'complete', scope: 'page', checked: 120, failed: 0, warned: 0, reviewed: 0, disclosure: '120 token pairs checked' },
]

export const A11Y_DEMO_SCENARIOS: readonly A11yDemoScenario[] = [
  {
    id: 'ready-for-handoff',
    label: 'Ready',
    explanation: 'The checklist is complete, sign-offs are current, and all three page audits are recorded.',
    widget: { totalChecks: 64, completedChecks: 64, totalSections: 16, signedSections: 16, staleSignoffs: 0, contrast: passingColors },
    evidence: completeEvidence,
  },
  {
    id: 'stale-signoff',
    label: 'Stale sign-off',
    explanation: 'The evidence changed after a section was signed off. That section needs another review.',
    widget: { totalChecks: 64, completedChecks: 64, totalSections: 16, signedSections: 15, staleSignoffs: 1, contrast: passingColors },
    evidence: completeEvidence,
  },
  {
    id: 'partial-node-scan',
    label: 'Capped scan',
    explanation: 'The token scan reached its 2,000-node cap. No failures were found in the scanned portion; coverage is still partial.',
    widget: { totalChecks: 64, completedChecks: 31, totalSections: 16, signedSections: 7, staleSignoffs: 0, contrast: passingColors },
    evidence: [
      ...completeEvidence.slice(0, 2),
      { kind: 'tokens', label: 'Token contrast', state: 'partial', scope: 'page', checked: 800, failed: 0, warned: 0, reviewed: 0, disclosure: '2,000-node traversal cap reached · partial evidence' },
    ],
  },
  {
    id: 'contrast-failure-120',
    label: 'Contrast failure',
    explanation: 'The selected colors fail normal-text contrast. A measured failure blocks handoff before any page audits have run.',
    widget: { totalChecks: 64, completedChecks: 15, totalSections: 16, signedSections: 2, staleSignoffs: 0, contrast: { text: '#1D1012', background: '#000000' } },
    evidence: [],
  },
]

/** WCAG relative luminance for opaque, six-digit sRGB colors. */
function relativeLuminance(hex: string): number {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error(`Unsupported sRGB color: ${hex}`)
  const channels = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

export function calculateDemoContrast(text: string, background: string): number {
  const first = relativeLuminance(text)
  const second = relativeLuminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

/** Matches the aggregation in product-contracts/src/scenarios.ts. */
export function buildA11yDemoScenario(scenario: A11yDemoScenario) {
  const { widget, evidence } = scenario
  const contrastRatio = calculateDemoContrast(widget.contrast.text, widget.contrast.background)
  const contrast = assessNormalTextContrast(contrastRatio)
  const recordedKinds = new Set(evidence.map((audit) => audit.kind))
  const remainingChecks = Math.max(0, widget.totalChecks - widget.completedChecks)
  const remainingSignoffs = Math.max(0, widget.totalSections - widget.signedSections)
  const partialEvidence = evidence.some((audit) => audit.state === 'partial' || audit.scope === 'selection')
  const record = deriveRecordReadiness({
    failures: evidence.reduce((total, audit) => total + audit.failed, 0),
    reviews: evidence.reduce((total, audit) => total + audit.warned + audit.reviewed, 0),
    staleSignoffs: widget.staleSignoffs,
    partialEvidence,
    missingAuditTypes: AUDIT_KINDS.filter((kind) => !recordedKinds.has(kind)).length,
    remainingChecks,
    remainingSignoffs,
    checklistComplete: remainingChecks === 0,
    signoffsComplete: remainingSignoffs === 0 && widget.staleSignoffs === 0,
    passingContrast: contrast.passesAA,
    contrastFails: !contrast.passesAA,
  })

  return { scenario, contrast, contrastRatio, recordedKinds: recordedKinds.size, partialEvidence, record }
}
