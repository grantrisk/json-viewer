"use client";

import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2.5">
        <Image src="/logo.svg" alt="JSON Viewer" width={28} height={28} className="rounded" />
        <h1 className="text-lg font-semibold">JSON Viewer</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
