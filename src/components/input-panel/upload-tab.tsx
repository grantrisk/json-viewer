"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileJson } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface UploadTabProps {
  onLoad: (json: string) => void;
}

export function UploadTab({ onLoad }: UploadTabProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (
        !file.name.endsWith(".json") &&
        !file.name.endsWith(".jsonc") &&
        file.type !== "application/json"
      ) {
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setError(`File too large (${sizeMB} MB). Maximum is 10 MB.`);
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onLoad(text);
      };
      reader.readAsText(file);
    },
    [onLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        aria-label="Drop JSON file or click to browse"
        className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        {fileName ? (
          <>
            <FileJson className="mb-2 h-10 w-10 text-primary" />
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground mt-1">Click or drop to replace</p>
          </>
        ) : (
          <>
            <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">Drop a JSON file here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
          </>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.jsonc,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        Choose File
      </Button>
    </div>
  );
}
