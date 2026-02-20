/**
 * Strip JSONC extensions (// line comments, /* block comments *​/, trailing commas)
 * while respecting quoted strings.
 */
export function stripJsonc(input: string): string {
  let result = "";
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // Quoted string – copy verbatim
    if (ch === '"') {
      result += '"';
      i++;
      while (i < input.length) {
        if (input[i] === "\\") {
          result += input[i] + (input[i + 1] ?? "");
          i += 2;
          continue;
        }
        if (input[i] === '"') {
          result += '"';
          i++;
          break;
        }
        result += input[i];
        i++;
      }
      continue;
    }

    // Line comment
    if (ch === "/" && input[i + 1] === "/") {
      i += 2;
      while (i < input.length && input[i] !== "\n") i++;
      continue;
    }

    // Block comment
    if (ch === "/" && input[i + 1] === "*") {
      i += 2;
      while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) i++;
      i += 2; // skip closing */
      continue;
    }

    result += ch;
    i++;
  }

  // Remove trailing commas before } or ]
  return result.replace(/,(\s*[}\]])/g, "$1");
}

export function validateJson(input: string): { valid: boolean; data?: unknown; error?: string } {
  try {
    const data = JSON.parse(input);
    return { valid: true, data };
  } catch (e) {
    // Try JSONC fallback
    try {
      const data = JSON.parse(stripJsonc(input));
      return { valid: true, data };
    } catch {
      return { valid: false, error: (e as Error).message };
    }
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

// --- Syntax highlighting ---

export type JsonTokenType = "key" | "string" | "number" | "boolean" | "null" | "bracket";

export interface JsonToken {
  type: JsonTokenType | "plain";
  value: string;
}

/**
 * Tokenize a JSON string into typed segments for syntax highlighting.
 * Handles the full JSON grammar: strings, numbers, booleans, null, brackets, and keys.
 */
export function tokenizeJson(text: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let i = 0;
  let plainBuf = "";

  const flush = () => {
    if (plainBuf) {
      tokens.push({ type: "plain", value: plainBuf });
      plainBuf = "";
    }
  };

  // Track whether we expect a key (after { or ,) vs a value
  let expectKey = false;

  while (i < text.length) {
    const ch = text[i];

    // Whitespace / structural chars
    if (ch === "{" || ch === "[") {
      flush();
      tokens.push({ type: "bracket", value: ch });
      expectKey = ch === "{";
      i++;
      continue;
    }
    if (ch === "}" || ch === "]") {
      flush();
      tokens.push({ type: "bracket", value: ch });
      expectKey = false;
      i++;
      continue;
    }
    if (ch === ":" || ch === ",") {
      flush();
      plainBuf += ch;
      flush();
      if (ch === ",") {
        // After comma, check context: if last bracket-like token was {, expect key
        for (let j = tokens.length - 1; j >= 0; j--) {
          if (tokens[j].type === "bracket") {
            expectKey = tokens[j].value === "{" || tokens[j].value === "{";
            break;
          }
        }
      } else {
        expectKey = false;
      }
      i++;
      continue;
    }

    // String (could be key or value)
    if (ch === '"') {
      flush();
      let str = '"';
      i++;
      while (i < text.length) {
        if (text[i] === "\\") {
          str += text[i] + (text[i + 1] || "");
          i += 2;
          continue;
        }
        if (text[i] === '"') {
          str += '"';
          i++;
          break;
        }
        str += text[i];
        i++;
      }
      // Look ahead past whitespace for ':' to determine if this is a key
      let isKey = expectKey;
      if (!isKey) {
        let k = i;
        while (k < text.length && (text[k] === " " || text[k] === "\t" || text[k] === "\n" || text[k] === "\r")) k++;
        if (text[k] === ":") isKey = true;
      }
      tokens.push({ type: isKey ? "key" : "string", value: str });
      continue;
    }

    // Numbers
    if (ch === "-" || (ch >= "0" && ch <= "9")) {
      flush();
      let num = "";
      while (i < text.length && /[0-9eE.+\-]/.test(text[i])) {
        num += text[i];
        i++;
      }
      tokens.push({ type: "number", value: num });
      continue;
    }

    // true / false / null
    if (text.startsWith("true", i)) {
      flush();
      tokens.push({ type: "boolean", value: "true" });
      i += 4;
      continue;
    }
    if (text.startsWith("false", i)) {
      flush();
      tokens.push({ type: "boolean", value: "false" });
      i += 5;
      continue;
    }
    if (text.startsWith("null", i)) {
      flush();
      tokens.push({ type: "null", value: "null" });
      i += 4;
      continue;
    }

    // Everything else (whitespace, newlines, etc.)
    plainBuf += ch;
    i++;
  }
  flush();
  return tokens;
}

// --- JSON path for line number ---

/**
 * Given formatted JSON text, compute the JSON path for the content at a given line number (1-indexed).
 * Returns a string like "data.users[0].name" or "" if unable to determine.
 */
export function getJsonPathForLine(text: string, lineNumber: number): string {
  const lines = text.split("\n");
  if (lineNumber < 1 || lineNumber > lines.length) return "";

  // We'll parse the JSON structure by tracking braces/brackets and keys
  const path: (string | number)[] = [];
  const contextStack: ("object" | "array")[] = [];
  const indexStack: number[] = [];
  let currentKey: string | null = null;

  for (let i = 0; i < lineNumber; i++) {
    const line = lines[i];
    // Check for key: "key": ...
    const keyMatch = line.match(/^\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*:/);
    if (keyMatch) {
      currentKey = keyMatch[1];
    }

    for (const ch of line) {
      if (ch === "{") {
        if (currentKey !== null) {
          path.push(currentKey);
          currentKey = null;
        } else if (contextStack.length > 0 && contextStack[contextStack.length - 1] === "array") {
          path.push(indexStack[indexStack.length - 1]);
        }
        contextStack.push("object");
        indexStack.push(0);
      } else if (ch === "[") {
        if (currentKey !== null) {
          path.push(currentKey);
          currentKey = null;
        } else if (contextStack.length > 0 && contextStack[contextStack.length - 1] === "array") {
          path.push(indexStack[indexStack.length - 1]);
        }
        contextStack.push("array");
        indexStack.push(0);
      } else if (ch === "}" || ch === "]") {
        contextStack.pop();
        indexStack.pop();
        if (path.length > 0) path.pop();
        currentKey = null;
      } else if (ch === ",") {
        currentKey = null;
        if (contextStack.length > 0 && contextStack[contextStack.length - 1] === "array") {
          indexStack[indexStack.length - 1]++;
        }
      }
    }
  }

  // Build the path string for the current line
  const targetLine = lines[lineNumber - 1];
  const targetKeyMatch = targetLine.match(/^\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*:/);

  const parts: string[] = [];
  for (const segment of path) {
    if (typeof segment === "number") {
      parts.push(`[${segment}]`);
    } else {
      if (parts.length > 0) parts.push(".");
      parts.push(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(segment) ? segment : `["${segment}"]`);
    }
  }

  if (targetKeyMatch) {
    const key = targetKeyMatch[1];
    if (parts.length > 0) parts.push(".");
    parts.push(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `["${key}"]`);
  } else if (contextStack.length > 0 && contextStack[contextStack.length - 1] === "array") {
    parts.push(`[${indexStack[indexStack.length - 1]}]`);
  }

  return parts.join("");
}

// --- Parse error position extraction ---

export interface ParseErrorInfo {
  message: string;
  line?: number;
  column?: number;
}

/**
 * Enhanced validateJson that extracts line/column position from parse errors.
 */
export function validateJsonWithPosition(input: string): { valid: boolean; data?: unknown; error?: ParseErrorInfo } {
  try {
    const data = JSON.parse(input);
    return { valid: true, data };
  } catch (e) {
    // Try JSONC fallback
    try {
      const data = JSON.parse(stripJsonc(input));
      return { valid: true, data };
    } catch {
      // Fall through to original error reporting
    }

    const msg = (e as Error).message;
    const errorInfo: ParseErrorInfo = { message: msg };

    // V8: "... at position N" or "... at line L column C"
    const posMatch = msg.match(/at position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      // Convert position to line/column
      let line = 1;
      let col = 1;
      for (let i = 0; i < pos && i < input.length; i++) {
        if (input[i] === "\n") {
          line++;
          col = 1;
        } else {
          col++;
        }
      }
      errorInfo.line = line;
      errorInfo.column = col;
    }

    const lineColMatch = msg.match(/at line (\d+) column (\d+)/);
    if (lineColMatch) {
      errorInfo.line = parseInt(lineColMatch[1], 10);
      errorInfo.column = parseInt(lineColMatch[2], 10);
    }

    return { valid: false, error: errorInfo };
  }
}
