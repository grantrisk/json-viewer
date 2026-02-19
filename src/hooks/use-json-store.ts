"use client";

import { useState, useCallback } from "react";
import { validateJsonWithPosition, type ParseErrorInfo } from "@/lib/json-utils";

export function useJsonStore() {
  const [rawJson, setRawJson] = useState("");
  const [jsonData, setJsonData] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<ParseErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadJson = useCallback((input: string) => {
    setRawJson(input);
    const result = validateJsonWithPosition(input);
    if (result.valid) {
      setJsonData(result.data);
      setError(null);
      setErrorInfo(null);
    } else {
      setJsonData(null);
      const errInfo = result.error!;
      setError(errInfo.message);
      setErrorInfo(errInfo);
    }
  }, []);

  const loadParsedJson = useCallback((data: unknown) => {
    setJsonData(data);
    setRawJson(JSON.stringify(data, null, 2));
    setError(null);
    setErrorInfo(null);
  }, []);

  const clear = useCallback(() => {
    setRawJson("");
    setJsonData(null);
    setError(null);
    setErrorInfo(null);
  }, []);

  return {
    rawJson,
    jsonData,
    error,
    errorInfo,
    isLoading,
    setIsLoading,
    setError,
    loadJson,
    loadParsedJson,
    clear,
  };
}
