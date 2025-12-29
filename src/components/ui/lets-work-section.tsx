import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LetsWorkSectionProps = {
  fullHeight?: boolean;
};

export function LetsWorkSection({ fullHeight = false }: LetsWorkSectionProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-gradient-to-br from-primary to-secondary px-6 py-12 text-primary-foreground",
        fullHeight && "min-h-screen flex items-center"
      )}
    >
      <div className="mx-auto w-full max-w-4xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/80">
          Let’s work together
        </p>
        <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
          Ready to bring ShieldMate to your team?
        </h2>
        <p className="mt-4 text-base text-primary-foreground/85 md:text-lg">
          We’ll help you launch a secure support workflow, connect with your
          partners, and keep approvals in the loop from day one.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="secondary" className="w-full sm:w-auto">
            Schedule a demo
          </Button>
          <a
            href="mailto:hello@2marines.us"
            className="text-sm font-medium underline underline-offset-4"
          >
            hello@2marines.us
          </a>
        </div>
      </div>
    </section>
  );
}
