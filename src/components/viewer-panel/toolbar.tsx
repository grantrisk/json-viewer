"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Check,
  Minimize2,
  Maximize2,
  ChevronsUpDown,
  ChevronsDownUp,
} from "lucide-react";
import { formatJson, minifyJson, getJsonSize } from "@/lib/json-utils";

interface ToolbarProps {
  jsonData: unknown;
  isMinified: boolean;
  onToggleMinify: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function Toolbar({
  jsonData,
  isMinified,
  onToggleMinify,
  onExpandAll,
  onCollapseAll,
}: ToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = isMinified ? minifyJson(jsonData) : formatJson(jsonData);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <Button variant="ghost" size="sm" onClick={onToggleMinify} className="h-8 text-xs">
        {isMinified ? (
          <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
        ) : (
          <Minimize2 className="mr-1.5 h-3.5 w-3.5" />
        )}
        {isMinified ? "Format" : "Minify"}
      </Button>

      <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 text-xs">
        {copied ? (
          <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="mr-1.5 h-3.5 w-3.5" />
        )}
        {copied ? "Copied!" : "Copy"}
      </Button>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <Button variant="ghost" size="sm" onClick={onExpandAll} className="h-8 text-xs">
        <ChevronsUpDown className="mr-1.5 h-3.5 w-3.5" />
        Expand
      </Button>

      <Button variant="ghost" size="sm" onClick={onCollapseAll} className="h-8 text-xs">
        <ChevronsDownUp className="mr-1.5 h-3.5 w-3.5" />
        Collapse
      </Button>

      <div className="ml-auto">
        <Badge variant="outline" className="text-xs font-normal">
          {getJsonSize(jsonData)}
        </Badge>
      </div>
    </div>
  );
}
