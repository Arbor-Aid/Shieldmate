import { render, screen } from "@testing-library/react";
import { CookieMissionPet } from "../CookieMissionPet";
import {
  CookieMissionReport,
  CookieState,
  CookieTaskStatus,
  getCookieHealthPresentation,
  getCookieMissionReportPresentation,
} from "../cookieMissionState";

const suppliedReports: readonly CookieMissionReport[] = [
  {
    responsibility: "Security Watchdog",
    status: "awaiting-approval",
    summary: "Gateway security tests passed; staging validation is pending.",
    evidenceLabel: "Supplied security evidence",
    evidence: "Commit e2179f9",
  },
  {
    responsibility: "Task Companion",
    status: "in-progress",
    summary: "COOKIE implementation is in progress.",
    evidenceLabel: "Supplied task evidence",
    evidence: "Owner review required",
  },
  {
    responsibility: "Continuity Guardian",
    status: "completed",
    summary: "Verified milestones remain available for review.",
    evidenceLabel: "Supplied continuity evidence",
    evidence: "Business Pipeline 43/43 local tests passed",
  },
];

describe("CookieMissionPet", () => {
  it.each<CookieState>(["idle", "checking", "working", "happy", "alert", "blocked"])(
    "renders the %s pet state accessibly",
    (state) => {
      render(
        <CookieMissionPet
          state={state}
          message={`COOKIE is ${state}`}
          evidence="Verified local evidence"
        />
      );

      expect(screen.getByRole("heading", { name: "COOKIE" })).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent(`COOKIE is ${state}`);
      expect(screen.getByText("Verified local evidence")).toBeInTheDocument();
    }
  );

  it.each([
    [{ kind: "idle" } as const, "idle"],
    [{ kind: "checking" } as const, "checking"],
    [{ kind: "success", status: 200 } as const, "happy"],
    [{ kind: "warning", status: 503 } as const, "alert"],
    [{ kind: "missing-data" } as const, "blocked"],
    [{ kind: "failure" } as const, "alert"],
  ])("derives deterministic presentation for %o", (outcome, expectedState) => {
    expect(getCookieHealthPresentation(outcome).state).toBe(expectedState);
  });

  it.each<[CookieTaskStatus, CookieState, string]>([
    ["completed", "happy", "Completed"],
    ["in-progress", "working", "In progress"],
    ["blocked", "blocked", "Blocked"],
    ["awaiting-approval", "alert", "Awaiting approval"],
  ])("maps supplied %s task evidence to %s", (status, expectedState, expectedLabel) => {
    const presentation = getCookieMissionReportPresentation({
      responsibility: "Task Companion",
      status,
      summary: "Supplied summary",
      evidenceLabel: "Supplied evidence",
      evidence: "Checkpoint detail",
    });

    expect(presentation.state).toBe(expectedState);
    expect(presentation.statusLabel).toBe(expectedLabel);
    expect(presentation.message).toBe("Supplied summary");
    expect(presentation.evidence).toBe("Supplied evidence: Checkpoint detail");
  });

  it("renders all reporting duties from explicitly labeled supplied evidence", () => {
    render(
      <CookieMissionPet
        state="idle"
        message="Ready to report supplied evidence."
        evidence="No live verification implied."
        reports={suppliedReports}
      />
    );

    expect(screen.getByRole("list", { name: "COOKIE mission reports" })).toBeInTheDocument();
    expect(screen.getByText("Security Watchdog")).toBeInTheDocument();
    expect(screen.getByText("Task Companion")).toBeInTheDocument();
    expect(screen.getByText("Continuity Guardian")).toBeInTheDocument();
    expect(screen.getByText("Supplied security evidence: Commit e2179f9")).toBeInTheDocument();
    expect(screen.getByText("Supplied task evidence: Owner review required")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Supplied continuity evidence: Business Pipeline 43/43 local tests passed"
      )
    ).toBeInTheDocument();
  });

  it("remains reporting-only with no execution or approval controls", () => {
    render(
      <CookieMissionPet
        state="alert"
        message="Deployment approval required."
        reports={suppliedReports}
      />
    );

    expect(
      screen.getByText(
        "Reporting only. COOKIE cannot execute work, change status, approve, or write externally."
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
