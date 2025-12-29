import { AppShell } from "@/components/layout/AppShell";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { submitUiuxEvent } from "@/services/uiuxAudit";

export default function AppUserAssistant() {
  return (
    <AppShell title="Assistant" subtitle="Ask ShieldMate for support">
      <PromptInputBox
        onSend={(message) => {
          console.log("PromptInputBox send:", message);
          void submitUiuxEvent({
            route: "/app/user/assistant",
            eventType: "prompt_sent",
            metadata: { length: message.length },
            timestamp: new Date().toISOString(),
          });
        }}
      />
    </AppShell>
  );
}
