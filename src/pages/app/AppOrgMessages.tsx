import { AppShell } from "@/components/layout/AppShell";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { submitUiuxEvent } from "@/services/uiuxAudit";

export default function AppOrgMessages() {
  return (
    <AppShell title="Org Messages" subtitle="Coordinate with your team">
      <PromptInputBox
        onSend={(message) => {
          console.log("Org message:", message);
          void submitUiuxEvent({
            route: "/app/org/messages",
            eventType: "prompt_sent",
            metadata: { length: message.length },
            timestamp: new Date().toISOString(),
          });
        }}
      />
    </AppShell>
  );
}
