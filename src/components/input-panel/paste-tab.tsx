"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
      <Textarea
        placeholder="Paste your JSON here..."
        className="flex-1 min-h-[100px] font-mono text-sm resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
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
