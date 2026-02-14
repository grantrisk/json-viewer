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

function nodeMatches(node: unknown, lowerQuery: string): boolean {
  if (node === null || node === undefined) {
    return String(node).toLowerCase().includes(lowerQuery);
  }
  if (typeof node !== "object") {
    return String(node).toLowerCase().includes(lowerQuery);
  }
  return false;
}

/**
 * Recursively filters a JSON tree to only include branches
 * where a key or leaf value matches the query.
 * Returns null if nothing in this subtree matches.
 */
export function filterJson(data: unknown, query: string): { filtered: unknown | null; matchCount: number } {
  if (!query.trim()) return { filtered: data, matchCount: 0 };

  const lowerQuery = query.toLowerCase();
  let matchCount = 0;

  function filter(node: unknown): unknown | null {
    // Leaf / primitive
    if (node === null || node === undefined || typeof node !== "object") {
      if (nodeMatches(node, lowerQuery)) {
        matchCount++;
        return node;
      }
      return undefined; // sentinel: no match
    }

    if (Array.isArray(node)) {
      const results: unknown[] = [];
      for (const item of node) {
        const r = filter(item);
        if (r !== undefined) results.push(r);
      }
      return results.length > 0 ? results : undefined;
    }

    // Object
    const obj = node as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    let hasMatch = false;

    for (const [key, value] of Object.entries(obj)) {
      const keyMatches = key.toLowerCase().includes(lowerQuery);
      if (keyMatches) matchCount++;

      const childResult = filter(value);
      if (keyMatches || childResult !== undefined) {
        // If the key matches, include the full original value so context is preserved
        result[key] = keyMatches ? value : childResult;
        hasMatch = true;
      }
    }

    return hasMatch ? result : undefined;
  }

  const filtered = filter(data);
  return { filtered: filtered === undefined ? null : filtered, matchCount };
}

/**
 * Check if a specific node's stringified value contains the query.
 * Used by customizeNode for highlighting.
 */
export function valueMatchesQuery(node: unknown, query: string): boolean {
  if (!query.trim()) return false;
  const lowerQuery = query.toLowerCase();
  if (node === null || node === undefined || typeof node !== "object") {
    return String(node).toLowerCase().includes(lowerQuery);
  }
  return false;
}

export function keyMatchesQuery(key: string | number | undefined, query: string): boolean {
  if (!query.trim() || key === undefined) return false;
  return String(key).toLowerCase().includes(query.toLowerCase());
}
