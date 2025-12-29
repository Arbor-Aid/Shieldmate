import { useEffect, useRef } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import { submitUiuxEvent } from "@/services/uiuxAudit";

export function ImageUploadDemo({ route = "/app/user/documents" }: { route?: string }) {
  const { accept, file, error, previewUrl, inputRef, onInputChange, clearFile } =
    useImageUpload({ maxSizeMb: 8 });
  const hadFileRef = useRef(false);

  useEffect(() => {
    if (file && !hadFileRef.current) {
      hadFileRef.current = true;
      void submitUiuxEvent({
        route,
        eventType: "image_selected",
        metadata: { size: file.size },
        timestamp: new Date().toISOString(),
      });
    }
    if (!file && hadFileRef.current) {
      hadFileRef.current = false;
      void submitUiuxEvent({
        route,
        eventType: "image_removed",
        timestamp: new Date().toISOString(),
      });
    }
  }, [file]);

  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <UploadCloud className="h-10 w-10 text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">Upload a document</h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop a file or browse to select.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={onInputChange}
            className="hidden"
          />
          <Button type="button" onClick={() => inputRef.current?.click()}>
            Select File
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>

      {file && (
        <div className="mt-6 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {previewUrl && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 w-full rounded-md object-contain"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
