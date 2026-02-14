"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";
import { useCallback } from "react";
import { valueMatchesQuery, keyMatchesQuery } from "@/lib/json-utils";
import "react18-json-view/src/style.css";

const JsonView = dynamic(() => import("react18-json-view").then((mod) => mod.default), {
  ssr: false,
});

interface JsonTreeViewProps {
  data: unknown;
  collapsed: number | boolean;
  searchQuery: string;
}

export function JsonTreeView({ data, collapsed, searchQuery }: JsonTreeViewProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

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

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading viewer...</p>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="json-tree-wrapper text-sm">
      <JsonView
        src={data}
        collapsed={collapsed}
        enableClipboard
        displaySize
        theme={isDark ? "vscode" : "github"}
        customizeNode={searchQuery ? customizeNode : undefined}
        style={{
          backgroundColor: "transparent",
          fontFamily: "var(--font-geist-mono), monospace",
        }}
      />
    </div>
  );
}
