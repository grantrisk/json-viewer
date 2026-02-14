"use client";

import { useState, useCallback, useMemo } from "react";
import { Toolbar } from "./toolbar";
import { SearchBar } from "./search-bar";
import { JsonTreeView } from "./json-tree-view";
import { filterJson } from "@/lib/json-utils";
import { Braces, SearchX } from "lucide-react";

interface ViewerPanelProps {
  jsonData: unknown | null;
}

export function ViewerPanel({ jsonData }: ViewerPanelProps) {
  const [isMinified, setIsMinified] = useState(false);
  const [collapsed, setCollapsed] = useState<number | boolean>(2);
  const [searchQuery, setSearchQuery] = useState("");

  const { filtered, matchCount } = useMemo(() => {
    if (!searchQuery.trim() || !jsonData) {
      return { filtered: jsonData, matchCount: 0 };
    }
    return filterJson(jsonData, searchQuery);
  }, [jsonData, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

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

  const displayData = searchQuery ? filtered : jsonData;
  const noResults = searchQuery && filtered === null;

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
          {noResults ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <SearchX className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No matches for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          ) : isMinified ? (
            <pre className="whitespace-pre-wrap break-all font-mono text-xs">
              {JSON.stringify(displayData)}
            </pre>
          ) : (
            <JsonTreeView
              data={displayData}
              collapsed={searchQuery ? false : collapsed}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
}
