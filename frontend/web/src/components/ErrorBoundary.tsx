import React from "react";
import { recordAudit } from "@/lib/audit";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary] Caught error", error, info);
    }
    recordAudit({
      category: "error",
      action: "react_error_boundary",
      error: error.message,
      details: { componentStack: info.componentStack },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            Please refresh the page. If the issue persists, contact support.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
