export type CookieState =
  | "idle"
  | "checking"
  | "working"
  | "happy"
  | "alert"
  | "blocked";

export type CookiePresentation = {
  state: CookieState;
  message: string;
  evidence?: string;
};

export type CookieResponsibility =
  | "Security Watchdog"
  | "Task Companion"
  | "Continuity Guardian";

export type CookieTaskStatus =
  | "completed"
  | "in-progress"
  | "blocked"
  | "awaiting-approval";

export type CookieMissionReport = {
  responsibility: CookieResponsibility;
  status: CookieTaskStatus;
  summary: string;
  evidenceLabel: string;
  evidence: string;
};

export type CookieMissionReportPresentation = CookiePresentation & {
  responsibility: CookieResponsibility;
  statusLabel: "Completed" | "In progress" | "Blocked" | "Awaiting approval";
};

const taskStatusPresentation: Record<
  CookieTaskStatus,
  Pick<CookieMissionReportPresentation, "state" | "statusLabel">
> = {
  completed: { state: "happy", statusLabel: "Completed" },
  "in-progress": { state: "working", statusLabel: "In progress" },
  blocked: { state: "blocked", statusLabel: "Blocked" },
  "awaiting-approval": { state: "alert", statusLabel: "Awaiting approval" },
};

export function getCookieMissionReportPresentation(
  report: CookieMissionReport
): CookieMissionReportPresentation {
  const status = taskStatusPresentation[report.status];

  return {
    ...status,
    responsibility: report.responsibility,
    message: report.summary,
    evidence: `${report.evidenceLabel}: ${report.evidence}`,
  };
}

type HealthOutcome =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "success"; status: number }
  | { kind: "warning"; status: number }
  | { kind: "missing-data" }
  | { kind: "failure" };

export function getCookieHealthPresentation(outcome: HealthOutcome): CookiePresentation {
  switch (outcome.kind) {
    case "checking":
      return {
        state: "checking",
        message: "Checking the existing gateway evidence.",
        evidence: "Reading MCP /health.",
      };
    case "success":
      return {
        state: "happy",
        message: "Gateway check passed. Mission support is ready.",
        evidence: `MCP /health · HTTP ${outcome.status}`,
      };
    case "warning":
      return {
        state: "alert",
        message: "The gateway responded, but it needs review.",
        evidence: `MCP /health · HTTP ${outcome.status}`,
      };
    case "missing-data":
      return {
        state: "blocked",
        message: "No gateway endpoint is configured.",
        evidence: "Configuration evidence is unavailable.",
      };
    case "failure":
      return {
        state: "alert",
        message: "The gateway check failed. Review the existing diagnostics.",
        evidence: "MCP /health request did not complete.",
      };
    default:
      return {
        state: "idle",
        message: "Ready to check mission support evidence.",
        evidence: "Source: existing MCP /health check.",
      };
  }
}
