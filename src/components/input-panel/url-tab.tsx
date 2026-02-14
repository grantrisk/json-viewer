"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Loader2 } from "lucide-react";

interface UrlTabProps {
  onLoad: (json: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function UrlTab({ onLoad, onError, isLoading, setIsLoading }: UrlTabProps) {
  const [url, setUrl] = useState("");

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

      onLoad(JSON.stringify(result.data, null, 2));
    } catch {
      onError("Failed to fetch URL");
    } finally {
      setIsLoading(false);
    }
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
    </div>
  );
}
