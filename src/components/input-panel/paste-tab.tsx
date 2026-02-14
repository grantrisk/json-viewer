"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LineNumberedTextarea } from "@/components/ui/line-numbered-textarea";
import { ClipboardPaste } from "lucide-react";

interface PasteTabProps {
  onLoad: (json: string) => void;
}

export function PasteTab({ onLoad }: PasteTabProps) {
  const [text, setText] = useState("");

  const handleLoad = () => {
    if (text.trim()) {
      onLoad(text.trim());
    }
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      <LineNumberedTextarea
        value={text}
        onChange={setText}
        placeholder="Paste your JSON here..."
        className="flex-1 min-h-[100px]"
      />
      <div className="flex gap-2 shrink-0">
        <Button onClick={handleLoad} disabled={!text.trim()} className="flex-1">
          <ClipboardPaste className="mr-2 h-4 w-4" />
          Load JSON
        </Button>
        {text && (
          <Button variant="outline" onClick={() => setText("")}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
