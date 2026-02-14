"use client";

import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toolbar } from "./toolbar";
import { SearchBar } from "./search-bar";
import { JsonTreeView } from "./json-tree-view";
import { searchJson } from "@/lib/json-utils";
import { Braces } from "lucide-react";

interface ViewerPanelProps {
  jsonData: unknown | null;
}

export function ViewerPanel({ jsonData }: ViewerPanelProps) {
  const [isMinified, setIsMinified] = useState(false);
  const [collapsed, setCollapsed] = useState<number | boolean>(2);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim() || !jsonData) {
        setMatchCount(0);
        return;
      }
      const result = searchJson(jsonData, query);
      setMatchCount(result.matchCount);
    },
    [jsonData]
  );

  if (!jsonData) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <Braces className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">No JSON loaded</p>
          <p className="text-sm text-muted-foreground mt-1">
            Paste, upload, or fetch JSON to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3 p-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
        Viewer
      </h2>
      <div className="shrink-0">
        <SearchBar onSearch={handleSearch} matchCount={matchCount} disabled={false} />
      </div>
      <div className="shrink-0">
        <Toolbar
          jsonData={jsonData}
          isMinified={isMinified}
          onToggleMinify={() => setIsMinified(!isMinified)}
          onExpandAll={() => setCollapsed(false)}
          onCollapseAll={() => setCollapsed(true)}
        />
      </div>
      <div className="flex-1 min-h-0 rounded-md border bg-card overflow-auto">
        <div className="p-4">
          {isMinified ? (
            <pre className="whitespace-pre-wrap break-all font-mono text-xs">
              {JSON.stringify(jsonData)}
            </pre>
          ) : (
            <JsonTreeView
              data={jsonData}
              collapsed={collapsed}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
}
