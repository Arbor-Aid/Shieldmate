import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";

export default function MarineCoinPrivacy() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">
          MarineCoin follows the ShieldMate privacy posture. We collect only the
          information required to administer pilot access, approvals, and
          compliance reporting.
        </p>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground">
          <p>
            We do not sell personal data. Access is limited to authorized
            personnel using claims-based RBAC.
          </p>
          <p>
            Contact hello@2marines.us for privacy requests or data corrections.
          </p>
        </div>
      </section>
    </MarineCoinLayout>
  );
}
