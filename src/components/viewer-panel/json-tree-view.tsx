"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";
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

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading viewer...</p>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  // When searching, expand everything so matches are visible
  const effectiveCollapsed = searchQuery ? false : collapsed;

  return (
    <div className="json-tree-wrapper text-sm">
      <JsonView
        src={data}
        collapsed={effectiveCollapsed}
        enableClipboard
        displaySize
        theme={isDark ? "vscode" : "github"}
        style={{
          backgroundColor: "transparent",
          fontFamily: "var(--font-geist-mono), monospace",
        }}
      />
    </div>
  );
}
