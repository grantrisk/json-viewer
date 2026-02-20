"use client";

import { useState, useCallback, useMemo } from "react";
import { Toolbar, type ViewMode } from "./toolbar";
import { SearchBar } from "./search-bar";
import { JsonTreeView } from "./json-tree-view";
import { filterJson, formatJson } from "@/lib/json-utils";
import { LineNumberedCode } from "@/components/ui/line-numbered-code";
import { ErrorBoundary } from "./error-boundary";
import { Braces, SearchX, ChevronRight } from "lucide-react";

interface ViewerPanelProps {
  jsonData: unknown | null;
}

export function ViewerPanel({ jsonData }: ViewerPanelProps) {
  const [isMinified, setIsMinified] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [collapsed, setCollapsed] = useState<number | boolean>(2);
  const [searchQuery, setSearchQuery] = useState("");
  const [codeMatchCount, setCodeMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  const { filtered, matchCount } = useMemo(() => {
    if (!searchQuery.trim() || !jsonData) {
      return { filtered: jsonData, matchCount: 0 };
    }
    return filterJson(jsonData, searchQuery);
  }, [jsonData, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentMatchIndex(0);
  }, []);

  const handleCodeMatchCount = useCallback((count: number) => {
    setCodeMatchCount(count);
  }, []);

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      const total = viewMode === "code" ? codeMatchCount : matchCount;
      if (total === 0) return;
      setCurrentMatchIndex((prev) => {
        if (direction === "next") return (prev + 1) % total;
        return (prev - 1 + total) % total;
      });
    },
    [viewMode, codeMatchCount, matchCount]
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

  const isCodeView = viewMode === "code";
  const displayData = searchQuery && !isCodeView && filterEnabled ? filtered : jsonData;
  const noResults = searchQuery && !isCodeView && filterEnabled && filtered === null;

  const activeMatchCount = isCodeView ? codeMatchCount : matchCount;

  const renderContent = () => {
    if (noResults) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <SearchX className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No matches for &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      );
    }

    if (viewMode === "tree") {
      return (
        <div className="p-4">
          <JsonTreeView
            data={displayData}
            collapsed={searchQuery ? false : collapsed}
            searchQuery={searchQuery}
            onPathChange={setCurrentPath}
          />
        </div>
      );
    }

    const text = isMinified
      ? JSON.stringify(displayData)
      : formatJson(displayData);

    return (
      <LineNumberedCode
        value={text}
        searchQuery={searchQuery}
        onMatchCount={handleCodeMatchCount}
        currentMatchIndex={currentMatchIndex}
        onPathSelect={setCurrentPath}
      />
    );
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3 p-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
        Viewer
      </h2>
      <div className="shrink-0">
        <SearchBar
          onSearch={handleSearch}
          matchCount={activeMatchCount}
          disabled={false}
          showNavigation={isCodeView && searchQuery.trim().length > 0}
          currentMatchIndex={currentMatchIndex}
          onNavigate={handleNavigate}
          showFilterToggle={!isCodeView && searchQuery.trim().length > 0}
          filterEnabled={filterEnabled}
          onToggleFilter={() => setFilterEnabled((f) => !f)}
        />
      </div>
      <div className="shrink-0">
        <Toolbar
          jsonData={jsonData}
          isMinified={isMinified}
          viewMode={viewMode}
          onToggleMinify={() => setIsMinified(!isMinified)}
          onSetViewMode={setViewMode}
          onExpandAll={() => setCollapsed(false)}
          onCollapseAll={() => setCollapsed(true)}
        />
      </div>
      {currentPath && (
        <div className="shrink-0 flex items-center gap-1 rounded-md bg-muted/50 px-3 py-1.5 text-xs font-mono text-muted-foreground animate-in fade-in duration-200 overflow-x-auto">
          {currentPath.split(/(?=\.)|(?=\[)/).filter(Boolean).map((segment, i) => (
            <span key={i} className="flex items-center gap-1 whitespace-nowrap">
              {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />}
              <span>{segment.startsWith(".") ? segment.slice(1) : segment}</span>
            </span>
          ))}
        </div>
      )}
      <div className="flex-1 min-h-0 rounded-md border bg-card overflow-auto" role="region" aria-label="JSON viewer">
        <ErrorBoundary jsonData={jsonData}>
          {renderContent()}
        </ErrorBoundary>
      </div>
    </div>
  );
}
