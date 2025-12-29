import { useEffect, useRef, useState } from "react";

type UseImageUploadOptions = {
  accept?: string;
  maxSizeMb?: number;
};

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { accept = "image/*", maxSizeMb = 8 } = options;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const selectFile = (next: File | null) => {
    if (!next) {
      setFile(null);
      setError(null);
      return;
    }
    if (next.size > maxSizeMb * 1024 * 1024) {
      setError(`File is larger than ${maxSizeMb}MB.`);
      setFile(null);
      return;
    }
    setError(null);
    setFile(next);
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    selectFile(next);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return {
    accept,
    file,
    error,
    previewUrl,
    inputRef,
    onInputChange,
    clearFile,
  };
}
