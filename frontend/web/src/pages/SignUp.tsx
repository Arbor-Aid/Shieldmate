import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  return (
    <MarketingLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Create your ShieldMate account</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Sign up with Google to access your secure support workspace.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/login">
            <Button>Continue to sign in</Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline">Talk to onboarding</Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
