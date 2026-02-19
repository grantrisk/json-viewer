"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LineNumberedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  errorLine?: number;
}

export function LineNumberedTextarea({
  value,
  onChange,
  placeholder,
  className,
  readOnly,
  errorLine,
}: LineNumberedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  const lines = value ? value.split("\n") : [""];
  const lineCount = lines.length;

  const syncScroll = useCallback(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Scroll to error line when it changes
  useEffect(() => {
    if (errorLine && textareaRef.current) {
      const lineHeight = 26.4; // matches leading-[1.65rem] ≈ 26.4px
      const scrollTop = (errorLine - 1) * lineHeight - textareaRef.current.clientHeight / 2;
      textareaRef.current.scrollTop = Math.max(0, scrollTop);
    }
  }, [errorLine]);

  return (
    <div
      className={cn(
        "flex rounded-md border bg-transparent transition-colors",
        focused && "ring-ring/50 ring-[3px] border-ring",
        className
      )}
    >
      <div
        ref={gutterRef}
        className="shrink-0 overflow-hidden select-none border-r bg-muted/50 py-2 text-right font-mono text-xs leading-[1.65rem] text-muted-foreground"
        aria-hidden
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i}
            className={cn(
              "px-2",
              errorLine === i + 1 && "bg-destructive/20 text-destructive font-bold"
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck={false}
        className="flex-1 resize-none bg-transparent py-2 px-3 font-mono text-sm leading-[1.65rem] outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
