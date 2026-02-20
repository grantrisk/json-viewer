"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, ChevronUp, ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  matchCount: number;
  disabled: boolean;
  currentMatchIndex?: number;
  onNavigate?: (direction: "prev" | "next") => void;
  showNavigation?: boolean;
  showFilterToggle?: boolean;
  filterEnabled?: boolean;
  onToggleFilter?: () => void;
}

export function SearchBar({
  onSearch,
  matchCount,
  disabled,
  currentMatchIndex,
  onNavigate,
  showNavigation,
  showFilterToggle,
  filterEnabled,
  onToggleFilter,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search keys and values..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 pr-8 h-9 text-sm"
          disabled={disabled}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => setQuery("")}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      {query && matchCount > 0 && showNavigation && onNavigate && (
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onNavigate("prev")}
            title="Previous match"
            aria-label="Previous match"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onNavigate("next")}
            title="Next match"
            aria-label="Next match"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      {query && showFilterToggle && onToggleFilter && (
        <Button
          variant={filterEnabled ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={onToggleFilter}
          title={filterEnabled ? "Show all (highlighting matches)" : "Filter to matches only"}
          aria-label="Toggle filter"
        >
          <Filter className={`h-3.5 w-3.5 ${filterEnabled ? "text-primary" : ""}`} />
        </Button>
      )}
      {query && (
        <Badge variant="secondary" className="text-xs whitespace-nowrap" aria-live="polite">
          {showNavigation && matchCount > 0 && currentMatchIndex != null
            ? `${currentMatchIndex + 1}/${matchCount}`
            : `${matchCount} ${matchCount === 1 ? "match" : "matches"}`}
        </Badge>
      )}
    </div>
  );
}
