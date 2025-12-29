"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type PromptInputBoxProps = {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onSend: (message: string) => void;
};

export function PromptInputBox({
  placeholder = "Ask ShieldMate...",
  disabled = false,
  className,
  onSend,
}: PromptInputBoxProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const style = document.createElement("style");
    style.setAttribute("data-shieldmate", "prompt-input");
    style.textContent = `
      .prompt-input::placeholder { opacity: 0.7; }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        className
      )}
    >
      <Textarea
        ref={textareaRef}
        className="prompt-input min-h-[96px] resize-y"
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
          }
        }}
      />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for a new line.
        </p>
        <Button type="button" onClick={handleSend} disabled={disabled}>
          Send
        </Button>
      </div>
    </div>
  );
}
