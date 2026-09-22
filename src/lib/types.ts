export type SignalStatus = "pass" | "warn" | "fail";

export interface SignalResult {
  id: string;
  label: string;
  status: SignalStatus;
  value: string;
  detail?: string;
  weight: number;
  source: string;
}

export type Tier = "excellent" | "good" | "needs_attention" | "critical";

export interface ScanSummary {
  url: string;
  scannedAt: string;
  overallScore: number;
  tier: Tier;
  tierLabel: string;
  topFixes: string[];
}

export interface ScanResponse extends ScanSummary {
  signals: SignalResult[];
}

export interface ScanRequestBody {
  url: string;
  businessName?: string;
}

export type ScanStreamEvent =
  | { type: "signal"; signal: SignalResult }
  | ({ type: "done" } & ScanSummary)
  | { type: "error"; message: string };
