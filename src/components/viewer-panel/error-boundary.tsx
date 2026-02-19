"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  jsonData: unknown;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.jsonData !== this.props.jsonData && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm text-muted-foreground mt-1">
              The viewer encountered an error rendering this JSON.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground mt-2 font-mono max-w-md truncate">
                {this.state.error.message}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </Button>
          {this.props.jsonData != null ? (
            <details className="w-full max-w-lg text-left mt-2">
              <summary className="text-xs text-muted-foreground cursor-pointer">
                Show raw JSON
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded-md border bg-muted/50 p-3 text-xs font-mono">
                {JSON.stringify(this.props.jsonData, null, 2)}
              </pre>
            </details>
          ) : null}
        </div>
      );
    }

    return this.props.children;
  }
}
