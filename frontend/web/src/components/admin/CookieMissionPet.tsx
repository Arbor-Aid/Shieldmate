import { Cookie } from "lucide-react";
import {
  CookieMissionReport,
  CookiePresentation,
  CookieState,
  getCookieMissionReportPresentation,
} from "./cookieMissionState";

const stateStyles: Record<CookieState, { label: string; badge: string; pet: string }> = {
  idle: {
    label: "Idle",
    badge: "bg-muted text-muted-foreground",
    pet: "border-border bg-muted/50 text-muted-foreground",
  },
  checking: {
    label: "Checking",
    badge: "bg-blue-100 text-blue-800",
    pet: "border-blue-200 bg-blue-50 text-blue-700",
  },
  working: {
    label: "Working",
    badge: "bg-violet-100 text-violet-800",
    pet: "border-violet-200 bg-violet-50 text-violet-700",
  },
  happy: {
    label: "Happy",
    badge: "bg-emerald-100 text-emerald-800",
    pet: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  alert: {
    label: "Alert",
    badge: "bg-amber-100 text-amber-800",
    pet: "border-amber-200 bg-amber-50 text-amber-700",
  },
  blocked: {
    label: "Blocked",
    badge: "bg-red-100 text-red-800",
    pet: "border-red-200 bg-red-50 text-red-700",
  },
};

type CookieMissionPetProps = CookiePresentation & {
  reports?: readonly CookieMissionReport[];
};

export function CookieMissionPet({ state, message, evidence, reports = [] }: CookieMissionPetProps) {
  const style = stateStyles[state];

  return (
    <section
      aria-labelledby="cookie-name"
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${style.pet}`}
          aria-hidden="true"
        >
          <Cookie className={state === "checking" ? "h-8 w-8 animate-pulse" : "h-8 w-8"} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="cookie-name" className="text-lg font-semibold">
              COOKIE
            </h2>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${style.badge}`}>
              {style.label}
            </span>
          </div>

          <p className="mt-2 text-sm text-foreground" role="status" aria-live="polite">
            {message}
          </p>
          {evidence && <p className="mt-1 text-xs text-muted-foreground">{evidence}</p>}
          {reports.length > 0 && (
            <ul className="mt-4 space-y-3" aria-label="COOKIE mission reports">
              {reports.map((report) => {
                const presentation = getCookieMissionReportPresentation(report);
                const reportStyle = stateStyles[presentation.state];

                return (
                  <li
                    key={report.responsibility}
                    className="rounded-lg border border-border bg-background/60 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-medium">{presentation.responsibility}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${reportStyle.badge}`}
                      >
                        {presentation.statusLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{presentation.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{presentation.evidence}</p>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Reporting only. COOKIE cannot execute work, change status, approve, or write externally.
          </p>
        </div>
      </div>
    </section>
  );
}
