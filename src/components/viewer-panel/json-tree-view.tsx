"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";
import { useCallback, useState } from "react";
import { valueMatchesQuery, keyMatchesQuery } from "@/lib/json-utils";
import { Copy, Check } from "lucide-react";
import "react18-json-view/src/style.css";

const JsonView = dynamic(() => import("react18-json-view").then((mod) => mod.default), {
  ssr: false,
});

interface JsonTreeViewProps {
  data: unknown;
  collapsed: number | boolean;
  searchQuery: string;
}

function buildPathString(currentPath: string[]): string {
  if (!currentPath || currentPath.length === 0) return "$";
  return currentPath.reduce((acc, segment) => {
    // Array index
    if (/^\d+$/.test(segment)) {
      return `${acc}[${segment}]`;
    }
    // Simple identifier
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(segment)) {
      return acc ? `${acc}.${segment}` : segment;
    }
    // Needs bracket notation
    return `${acc}["${segment}"]`;
  }, "");
}

export function JsonTreeView({ data, collapsed, searchQuery }: JsonTreeViewProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const customizeNode = useCallback(
    (params: { node: unknown; indexOrName: string | number | undefined; depth: number }) => {
      if (!searchQuery) return undefined;

      const keyMatch = keyMatchesQuery(params.indexOrName, searchQuery);
      const valMatch = valueMatchesQuery(params.node, searchQuery);

      if (keyMatch || valMatch) {
        return { className: "json-search-highlight" };
      }
      return undefined;
    },
    [searchQuery]
  );

  const customizeCopy = useCallback(
    (node: unknown, nodeMeta?: { currentPath?: string[] }) => {
      if (nodeMeta?.currentPath && nodeMeta.currentPath.length > 0) {
        const path = buildPathString(nodeMeta.currentPath);
        setCopiedPath(path);
        setTimeout(() => setCopiedPath(null), 2000);
        // Return the path as the copied value
        return path;
      }
      // For root, copy the stringified value
      return typeof node === "object" ? JSON.stringify(node, null, 2) : String(node);
    },
    []
  );

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading viewer...</p>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="json-tree-wrapper text-sm relative">
      <JsonView
        src={data}
        collapsed={collapsed}
        enableClipboard
        displaySize
        theme={isDark ? "vscode" : "github"}
        customizeNode={searchQuery ? customizeNode : undefined}
        customizeCopy={customizeCopy}
        style={{
          backgroundColor: "transparent",
          fontFamily: "var(--font-geist-mono), monospace",
        }}
      />
      {copiedPath && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs font-mono shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-muted-foreground">Copied path:</span>
          <span className="font-medium">{copiedPath}</span>
        </div>
      )}
    </div>
  );
}
