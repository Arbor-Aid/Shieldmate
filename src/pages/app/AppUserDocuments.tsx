import { AppShell } from "@/components/layout/AppShell";
import { ImageUploadDemo } from "@/components/ui/image-upload-demo";

export default function AppUserDocuments() {
  return (
    <AppShell
      title="Documents"
      subtitle="Upload documents for review and support"
    >
      <ImageUploadDemo />
    </AppShell>
  );
}
