"use client";

import { Braces } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <Braces className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">JSON Viewer</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
