import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const TIMEOUT_MS = 5000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only HTTP and HTTPS URLs are allowed" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
    } catch (err) {
      clearTimeout(timeout);
      if ((err as Error).name === "AbortError") {
        return NextResponse.json({ error: "Request timed out (5s)" }, { status: 408 });
      }
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 502 });
    }

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Remote server returned ${response.status}` },
        { status: 502 }
      );
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_SIZE) {
      return NextResponse.json({ error: "Response too large (>10MB)" }, { status: 413 });
    }

    const text = await response.text();
    if (text.length > MAX_SIZE) {
      return NextResponse.json({ error: "Response too large (>10MB)" }, { status: 413 });
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Response is not valid JSON" }, { status: 422 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
