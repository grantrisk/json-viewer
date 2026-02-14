"use client";

import { Header } from "@/components/layout/header";
import { InputPanel } from "@/components/input-panel/input-panel";
import { ViewerPanel } from "@/components/viewer-panel/viewer-panel";
import { useJsonStore } from "@/hooks/use-json-store";

export default function Home() {
  const { jsonData, error, isLoading, setIsLoading, setError, loadJson, clear } = useJsonStore();

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex w-full min-h-0 flex-col border-b lg:w-[40%] lg:border-b-0 lg:border-r">
          <InputPanel
            onLoad={loadJson}
            onError={setError}
            error={error}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          {jsonData !== null && (
            <div className="px-4 pb-4 shrink-0">
              <button
                onClick={clear}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear loaded JSON
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <ViewerPanel jsonData={jsonData} />
        </div>
      </main>
    </div>
  );
}
