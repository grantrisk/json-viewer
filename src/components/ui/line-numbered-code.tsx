"use client";

import { useRef, useCallback } from "react";

interface LineNumberedCodeProps {
  value: string;
  className?: string;
}

export function LineNumberedCode({ value, className }: LineNumberedCodeProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = value ? value.split("\n") : [""];

  const syncScroll = useCallback(() => {
    if (codeRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = codeRef.current.scrollTop;
    }
  }, []);

  return (
    <div className={`flex font-mono text-xs ${className ?? ""}`}>
      <div
        ref={gutterRef}
        className="shrink-0 sticky left-0 overflow-hidden select-none border-r bg-muted/50 py-3 text-right text-muted-foreground"
        aria-hidden
      >
        {lines.map((_, i) => (
          <div key={i} className="px-2 leading-5">
            {i + 1}
          </div>
        ))}
      </div>
      <pre
        ref={codeRef}
        onScroll={syncScroll}
        className="flex-1 overflow-auto whitespace-pre py-3 px-3 leading-5"
      >
        {value}
      </pre>
    </div>
  );
}
