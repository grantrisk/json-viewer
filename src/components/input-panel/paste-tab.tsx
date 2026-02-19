"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LineNumberedTextarea } from "@/components/ui/line-numbered-textarea";
import { ClipboardPaste, Check } from "lucide-react";
import { validateJson } from "@/lib/json-utils";
import type { ParseErrorInfo } from "@/lib/json-utils";

interface PasteTabProps {
  onLoad: (json: string) => void;
  errorInfo?: ParseErrorInfo | null;
}

export function PasteTab({ onLoad, errorInfo }: PasteTabProps) {
  const [text, setText] = useState("");
  const [autoLoaded, setAutoLoaded] = useState(false);
  const lastAutoLoadedRef = useRef("");

  const handleLoad = () => {
    if (text.trim()) {
      onLoad(text.trim());
    }
  };

  // Auto-parse on paste with 500ms debounce
  useEffect(() => {
    if (!text.trim()) {
      setAutoLoaded(false);
      lastAutoLoadedRef.current = "";
      return;
    }

    // Don't re-auto-load the same text
    if (text.trim() === lastAutoLoadedRef.current) return;

    const timer = setTimeout(() => {
      const trimmed = text.trim();
      const result = validateJson(trimmed);
      if (result.valid) {
        onLoad(trimmed);
        lastAutoLoadedRef.current = trimmed;
        setAutoLoaded(true);
        setTimeout(() => setAutoLoaded(false), 2000);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [text, onLoad]);

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    setAutoLoaded(false);
  }, []);

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      <LineNumberedTextarea
        value={text}
        onChange={handleTextChange}
        placeholder="Paste your JSON here..."
        className="flex-1 min-h-[100px]"
        errorLine={errorInfo?.line}
      />
      <div className="flex items-center gap-2 shrink-0">
        <Button onClick={handleLoad} disabled={!text.trim()} className="flex-1">
          <ClipboardPaste className="mr-2 h-4 w-4" />
          Load JSON
        </Button>
        {autoLoaded && (
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 animate-in fade-in">
            <Check className="h-3 w-3" />
            Auto-loaded
          </span>
        )}
        {text && (
          <Button variant="outline" onClick={() => setText("")}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
