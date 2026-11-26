import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <section className={cn("py-10 md:py-14", className)}>{children}</section>;
}