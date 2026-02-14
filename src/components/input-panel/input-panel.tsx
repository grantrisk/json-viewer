"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasteTab } from "./paste-tab";
import { UploadTab } from "./upload-tab";
import { UrlTab } from "./url-tab";
import { ClipboardPaste, Upload, Globe } from "lucide-react";

interface InputPanelProps {
  onLoad: (json: string) => void;
  onError: (error: string) => void;
  error: string | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function InputPanel({ onLoad, onError, error, isLoading, setIsLoading }: InputPanelProps) {
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3 p-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Input</h2>
      <Tabs defaultValue="paste" className="flex flex-1 min-h-0 flex-col">
        <TabsList className="w-full shrink-0">
          <TabsTrigger value="paste" className="flex-1">
            <ClipboardPaste className="mr-1.5 h-3.5 w-3.5" />
            Paste
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="flex-1">
            <Globe className="mr-1.5 h-3.5 w-3.5" />
            URL
          </TabsTrigger>
        </TabsList>
        <TabsContent value="paste" className="mt-3 flex flex-1 min-h-0 flex-col">
          <PasteTab onLoad={onLoad} />
        </TabsContent>
        <TabsContent value="upload" className="mt-3">
          <UploadTab onLoad={onLoad} />
        </TabsContent>
        <TabsContent value="url" className="mt-3">
          <UrlTab onLoad={onLoad} onError={onError} isLoading={isLoading} setIsLoading={setIsLoading} />
        </TabsContent>
      </Tabs>
      {error && (
        <div className="shrink-0 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <p className="font-medium">Invalid JSON</p>
          <p className="mt-1 text-xs opacity-80">{error}</p>
        </div>
      )}
    </div>
  );
}
