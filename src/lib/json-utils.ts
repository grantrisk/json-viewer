export function validateJson(input: string): { valid: boolean; data?: unknown; error?: string } {
  try {
    const data = JSON.parse(input);
    return { valid: true, data };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function minifyJson(data: unknown): string {
  return JSON.stringify(data);
}

export function getJsonSize(data: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(data)).length;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function countNodes(data: unknown): number {
  if (data === null || typeof data !== "object") return 1;
  if (Array.isArray(data)) {
    return 1 + data.reduce((sum, item) => sum + countNodes(item), 0);
  }
  return 1 + Object.values(data).reduce((sum, val) => sum + countNodes(val), 0);
}

export interface MatchInfo {
  matchCount: number;
  matchingPaths: Set<string>;
}

export function searchJson(data: unknown, query: string): MatchInfo {
  if (!query.trim()) return { matchCount: 0, matchingPaths: new Set() };

  const lowerQuery = query.toLowerCase();
  const matchingPaths = new Set<string>();
  let matchCount = 0;

  function addAncestorPaths(path: string) {
    const parts = path.split(".");
    for (let i = 1; i <= parts.length; i++) {
      matchingPaths.add(parts.slice(0, i).join("."));
    }
  }

  function traverse(node: unknown, currentPath: string) {
    if (node === null || node === undefined) {
      if (String(node).toLowerCase().includes(lowerQuery)) {
        matchCount++;
        addAncestorPaths(currentPath);
      }
      return;
    }

    if (typeof node !== "object") {
      if (String(node).toLowerCase().includes(lowerQuery)) {
        matchCount++;
        addAncestorPaths(currentPath);
      }
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((item, index) => {
        traverse(item, `${currentPath}.${index}`);
      });
    } else {
      Object.entries(node as Record<string, unknown>).forEach(([key, value]) => {
        const childPath = `${currentPath}.${key}`;
        if (key.toLowerCase().includes(lowerQuery)) {
          matchCount++;
          addAncestorPaths(childPath);
        }
        traverse(value, childPath);
      });
    }
  }

  traverse(data, "root");
  return { matchCount, matchingPaths };
}
