"use client";

import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import { tokenizeJson, type JsonToken, getJsonPathForLine } from "@/lib/json-utils";
import { Copy, Check } from "lucide-react";

interface LineNumberedCodeProps {
  value: string;
  className?: string;
  searchQuery?: string;
  onMatchCount?: (count: number) => void;
  currentMatchIndex?: number;
}

/**
 * Renders a single line with syntax-highlighted tokens and optional search highlighting.
 */
function renderHighlightedLine(
  lineTokens: JsonToken[],
  searchQuery: string | undefined
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let nodeKey = 0;

  for (const token of lineTokens) {
    const className = token.type !== "plain" ? `json-${token.type}` : undefined;

    if (searchQuery && searchQuery.trim()) {
      // Split token value by search matches (case-insensitive)
      const parts = splitByQuery(token.value, searchQuery);
      for (const part of parts) {
        if (part.match) {
          nodes.push(
            <mark key={nodeKey++} className="json-search-highlight" data-search-match="true">
              {className ? <span className={className}>{part.text}</span> : part.text}
            </mark>
          );
        } else {
          nodes.push(
            className
              ? <span key={nodeKey++} className={className}>{part.text}</span>
              : <span key={nodeKey++}>{part.text}</span>
          );
        }
      }
    } else {
      nodes.push(
        className
          ? <span key={nodeKey++} className={className}>{token.value}</span>
          : <span key={nodeKey++}>{token.value}</span>
      );
    }
  }

  return nodes;
}

function splitByQuery(text: string, query: string): { text: string; match: boolean }[] {
  if (!query.trim()) return [{ text, match: false }];
  const parts: { text: string; match: boolean }[] = [];
  const lower = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let lastIndex = 0;

  let idx = lower.indexOf(lowerQuery, lastIndex);
  while (idx !== -1) {
    if (idx > lastIndex) {
      parts.push({ text: text.slice(lastIndex, idx), match: false });
    }
    parts.push({ text: text.slice(idx, idx + query.length), match: true });
    lastIndex = idx + query.length;
    idx = lower.indexOf(lowerQuery, lastIndex);
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), match: false });
  }
  return parts.length > 0 ? parts : [{ text, match: false }];
}

export function LineNumberedCode({
  value,
  className,
  searchQuery,
  onMatchCount,
  currentMatchIndex,
}: LineNumberedCodeProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [pathCopied, setPathCopied] = useState(false);
  const [clickedLine, setClickedLine] = useState<number | null>(null);

  const lines = value ? value.split("\n") : [""];

  // Tokenize the whole value, then split tokens by line
  const tokensByLine = useMemo(() => {
    const allTokens = tokenizeJson(value);
    const result: JsonToken[][] = [[]];
    let lineIdx = 0;

    for (const token of allTokens) {
      // Tokens can span multiple lines (though mostly just whitespace does)
      const parts = token.value.split("\n");
      for (let p = 0; p < parts.length; p++) {
        if (p > 0) {
          lineIdx++;
          if (!result[lineIdx]) result[lineIdx] = [];
        }
        if (parts[p]) {
          result[lineIdx] = result[lineIdx] || [];
          result[lineIdx].push({ type: token.type, value: parts[p] });
        }
      }
    }
    return result;
  }, [value]);

  // Count search matches and report to parent
  const matchCount = useMemo(() => {
    if (!searchQuery?.trim()) return 0;
    const lower = value.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    let count = 0;
    let idx = lower.indexOf(lowerQuery);
    while (idx !== -1) {
      count++;
      idx = lower.indexOf(lowerQuery, idx + lowerQuery.length);
    }
    return count;
  }, [value, searchQuery]);

  useEffect(() => {
    onMatchCount?.(matchCount);
  }, [matchCount, onMatchCount]);

  // Scroll to current match
  useEffect(() => {
    if (currentMatchIndex == null || !codeRef.current) return;
    const marks = codeRef.current.querySelectorAll("[data-search-match]");
    if (marks[currentMatchIndex]) {
      marks[currentMatchIndex].scrollIntoView({ block: "center", behavior: "smooth" });
      // Add active class
      marks.forEach((m) => m.classList.remove("json-search-active"));
      marks[currentMatchIndex].classList.add("json-search-active");
    }
  }, [currentMatchIndex, matchCount]);

  const syncScroll = useCallback(() => {
    if (codeRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = codeRef.current.scrollTop;
    }
  }, []);

  const handleLineClick = useCallback(
    (lineNum: number) => {
      const path = getJsonPathForLine(value, lineNum);
      if (path) {
        setSelectedPath(path);
        setClickedLine(lineNum);
        setPathCopied(false);
        navigator.clipboard.writeText(path).then(() => {
          setPathCopied(true);
          setTimeout(() => {
            setPathCopied(false);
            setClickedLine(null);
          }, 2000);
        });
      }
    },
    [value]
  );

  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <div className="flex flex-1 min-h-0 font-mono text-xs">
        <div
          ref={gutterRef}
          className="shrink-0 sticky left-0 overflow-hidden select-none border-r bg-muted/50 py-3 text-right text-muted-foreground"
          aria-hidden
        >
          {lines.map((_, i) => (
            <div
              key={i}
              className={`px-2 leading-5 cursor-pointer hover:text-foreground hover:bg-muted/80 transition-colors ${
                clickedLine === i + 1 ? "bg-primary/20 text-primary font-bold" : ""
              }`}
              onClick={() => handleLineClick(i + 1)}
              title="Click to copy JSON path"
            >
              {clickedLine === i + 1 ? (
                <span className="flex items-center justify-end gap-0.5">
                  <Check className="h-2.5 w-2.5 text-green-500" />
                </span>
              ) : (
                i + 1
              )}
            </div>
          ))}
        </div>
        <pre
          ref={codeRef}
          onScroll={syncScroll}
          className="flex-1 overflow-auto whitespace-pre py-3 px-3 leading-5"
        >
          {tokensByLine.map((lineTokens, i) => (
            <div key={i}>
              {lineTokens.length > 0
                ? renderHighlightedLine(lineTokens, searchQuery)
                : "\n"}
            </div>
          ))}
        </pre>
      </div>
      {selectedPath && (
        <div className="shrink-0 flex items-center gap-2 border-t bg-muted/30 px-3 py-1.5 text-xs font-mono text-muted-foreground">
          <span className="text-foreground/70">Path:</span>
          <span className="flex-1 truncate">{selectedPath}</span>
          {pathCopied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          <span className="text-[10px]">{pathCopied ? "Copied!" : "Copied to clipboard"}</span>
        </div>
      )}
    </div>
  );
}
