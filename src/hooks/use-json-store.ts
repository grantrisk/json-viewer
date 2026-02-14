"use client";

import { useState, useCallback } from "react";
import { validateJson } from "@/lib/json-utils";

export function useJsonStore() {
  const [rawJson, setRawJson] = useState("");
  const [jsonData, setJsonData] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadJson = useCallback((input: string) => {
    setRawJson(input);
    const result = validateJson(input);
    if (result.valid) {
      setJsonData(result.data);
      setError(null);
    } else {
      setJsonData(null);
      setError(result.error || "Invalid JSON");
    }
  }, []);

  const loadParsedJson = useCallback((data: unknown) => {
    setJsonData(data);
    setRawJson(JSON.stringify(data, null, 2));
    setError(null);
  }, []);

  const clear = useCallback(() => {
    setRawJson("");
    setJsonData(null);
    setError(null);
  }, []);

  return {
    rawJson,
    jsonData,
    error,
    isLoading,
    setIsLoading,
    setError,
    loadJson,
    loadParsedJson,
    clear,
  };
}
