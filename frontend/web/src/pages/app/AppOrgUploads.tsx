import { AppShell } from "@/components/layout/AppShell";
import { ImageUploadDemo } from "@/components/ui/image-upload-demo";

export default function AppOrgUploads() {
  return (
    <AppShell title="Org Uploads" subtitle="Collect documents from clients">
      <ImageUploadDemo route="/app/org/uploads" />
    </AppShell>
  );
}
