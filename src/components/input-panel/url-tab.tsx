"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Loader2, X } from "lucide-react";

const STORAGE_KEY = "json-viewer-recent-urls";
const MAX_RECENT = 5;

function getRecentUrls(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function addRecentUrl(url: string) {
  const urls = getRecentUrls().filter((u) => u !== url);
  urls.unshift(url);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls.slice(0, MAX_RECENT)));
}

function removeRecentUrl(url: string) {
  const urls = getRecentUrls().filter((u) => u !== url);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

interface UrlTabProps {
  onLoad: (json: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function UrlTab({ onLoad, onError, isLoading, setIsLoading }: UrlTabProps) {
  const [url, setUrl] = useState("");
  const [recentUrls, setRecentUrls] = useState<string[]>([]);

  useEffect(() => {
    setRecentUrls(getRecentUrls());
  }, []);

  const handleFetch = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/fetch-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        onError(result.error || "Failed to fetch JSON");
        return;
      }

      addRecentUrl(url.trim());
      setRecentUrls(getRecentUrls());
      onLoad(JSON.stringify(result.data, null, 2));
    } catch {
      onError("Failed to fetch URL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRecent = (urlToRemove: string) => {
    removeRecentUrl(urlToRemove);
    setRecentUrls(getRecentUrls());
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Input
          placeholder="https://api.example.com/data.json"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFetch()}
          type="url"
          aria-label="URL to fetch"
        />
        <p className="text-xs text-muted-foreground">
          Enter a URL that returns JSON. The request is proxied server-side to avoid CORS issues.
        </p>
      </div>
      <Button onClick={handleFetch} disabled={!url.trim() || isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Globe className="mr-2 h-4 w-4" />
        )}
        {isLoading ? "Fetching..." : "Fetch JSON"}
      </Button>
      {recentUrls.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Recent</p>
          {recentUrls.map((recentUrl) => (
            <div
              key={recentUrl}
              className="flex items-center gap-1.5 group"
            >
              <button
                type="button"
                className="flex-1 truncate text-left text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => setUrl(recentUrl)}
              >
                {recentUrl}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveRecent(recentUrl)}
                aria-label={`Remove ${recentUrl}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
