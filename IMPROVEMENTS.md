# JSON Viewer - Core Feature Improvements

> "The Build Trap is when organizations become stuck measuring their success
> by outputs rather than outcomes." — Melissa Perri, *Escaping the Build Trap*
>
> This document focuses on making the **core value proposition** of this tool
> rock-solid before adding anything new. No feature creep. No shiny objects.
> The question is not "what else can we build?" but "does the thing we built
> actually work well for every user, every time?"

---

## The Core Value Proposition

**A user has JSON. They need to understand it quickly.**

Everything below serves that single outcome. If an improvement doesn't make
the "paste/upload/fetch -> view -> understand" loop faster, clearer, or more
reliable, it doesn't belong here.

---

## 1. JSON Input (Get Data In)

### 1.1 Paste Tab
- [x] **Handle non-JSON gracefully** — If a user pastes malformed JSON, show
  the exact line and column of the syntax error, not just a generic message.
  Help them fix it, don't just reject it.
- [x] **Auto-detect and load on paste** — Require the user to click "Load" after
  pasting is an extra step with no value. Auto-parse on paste (with debounce)
  and show a live preview. Keep the explicit "Load" as a fallback.
- [x] **Support JSON with comments / trailing commas** — Many real-world JSON
  files (tsconfig, eslint configs) use JSONC. Strip comments and trailing
  commas before parsing so users don't hit a wall.
- [ ] **Large paste performance** — Pasting 50k+ lines into the textarea with
  line numbers will lag. Profile and optimize or virtualize the line-numbered
  textarea for large inputs.

### 1.2 File Upload
- [ ] **Show a loading/progress indicator** — There is no feedback between
  dropping a file and seeing the result. For large files this is confusing.
- [ ] **Validate file size before reading** — The URL fetch caps at 10MB but
  file upload has no limit. Add a client-side size check with a clear message.
- [ ] **Support multiple JSON-like extensions** — Accept `.jsonc`, `.geojson`,
  `.har`, `.jsonl` (line-delimited), not just `.json`. Users have JSON in
  many containers.

### 1.3 URL Fetch
- [ ] **Show the actual HTTP error** — "Failed to fetch" is not helpful. Surface
  status codes (404, 403, 500) and response bodies when possible.
- [ ] **Add a retry button on failure** — Don't make the user re-enter the URL
  and click fetch again. One-click retry.
- [ ] **Remember recent URLs** — Store the last 5 URLs in localStorage so users
  working with the same APIs don't re-type them every session.

---

## 2. JSON Viewing (Understand the Data)

### 2.1 Tree View
- [x] **Show data types visually** — Strings, numbers, booleans, nulls, arrays,
  and objects should be visually distinct at a glance (color, icon, or label).
  The current tree view relies on the library defaults which are subtle.
- [x] **Show array lengths and object key counts** — When a node is collapsed,
  show `[42 items]` or `{7 keys}` so users understand scale without expanding.
- [x] **Click-to-copy path** — Clicking a key should copy its JSON path
  (e.g., `data.users[0].name`) to the clipboard. This is the #1 reason
  developers use JSON viewers.
- [x] **Click-to-copy value** — Clicking a value should offer to copy just that
  value. Currently copy is whole-document only.
- [ ] **Keyboard navigation** — Arrow keys to navigate the tree, Enter to
  expand/collapse, Escape to go up a level. Power users expect this.

### 2.2 Code View
- [x] **Syntax highlighting** — The code view is plain monochrome text. Add
  proper JSON syntax highlighting (keys, strings, numbers, booleans, null
  each in a distinct color). This is table stakes for a code viewer.
- [x] **Search highlighting in code view** — Search only highlights in tree
  mode. Code view should highlight matches too with scroll-to-match.
- [ ] **Line wrapping toggle** — Long string values force horizontal scrolling.
  Give users the option to wrap lines.
- [x] **Click line to see JSON path** — Show the JSON path for the value on
  the clicked line (in a toast or status bar).

### 2.3 Both Views
- [ ] **Breadcrumb / path bar** — When navigating deep JSON, show the current
  path (e.g., `root > data > users > [0] > address`) so users don't lose
  context.
- [ ] **Node count / depth summary** — Show total keys, max depth, and
  array sizes in a stats bar. Helps users orient in unfamiliar JSON.

---

## 3. Search & Filter (Find What You Need)

- [x] **Search in code view** — Currently search only works in tree view. This
  is a broken experience; users switch views and lose search.
- [x] **Navigate between matches** — Add previous/next buttons (or Enter /
  Shift+Enter) to jump between search results. Showing a count without
  navigation is frustrating.
- [ ] **Search by JSON path** — Allow queries like `users[0].name` to jump
  directly to a node. Developers think in paths.
- [ ] **Regex support** — Add a toggle for regex search. Power users need
  pattern matching (e.g., find all UUIDs, all email-shaped values).
- [ ] **Filter preserves sibling context** — When filtering the tree, currently
  matched nodes lose their position context. Show the parent chain fully
  so users understand *where* in the structure the match lives.

---

## 4. Error Handling & Edge Cases

- [x] **JSON parse errors with line/column** — When validation fails, highlight
  the exact position of the error in the paste textarea. Don't just show a
  text error below.
- [ ] **Handle empty JSON gracefully** — `{}`, `[]`, `null`, `""`, `0` are all
  valid JSON. Make sure each displays meaningfully, not as a blank screen.
- [ ] **Handle duplicate keys** — JSON technically allows duplicate keys but
  `JSON.parse` silently drops them. Warn the user when this happens.
- [ ] **Handle circular reference display** — If JSON is loaded programmatically
  (via future features), ensure circular refs don't crash the tree renderer.
- [x] **Add an error boundary** — A rendering crash in the tree view currently
  takes down the whole app. Wrap panels in React error boundaries with a
  "something went wrong, here's the raw JSON" fallback.
- [ ] **Max render size guard** — If JSON has 100k+ nodes, warn the user and
  offer to show a truncated/paginated view rather than freezing the browser.

---

## 5. Performance (It Should Never Feel Slow)

- [ ] **Virtualize the tree view** — `react18-json-view` renders the entire
  tree into the DOM. For large JSON (10k+ nodes), this will freeze the UI.
  Evaluate virtualizing or lazy-rendering collapsed branches.
- [ ] **Virtualize the code view** — Line-numbered code view re-renders all
  lines on every change. Use windowed rendering for large documents.
- [ ] **Web Worker for parsing** — Move `JSON.parse` and `formatJson` to a
  Web Worker so the UI thread stays responsive for large payloads.
- [ ] **Debounce format/minify toggle** — Rapid toggling on large JSON can
  queue expensive operations. Debounce or disable during processing.
- [ ] **Memoize filtered results** — `filterJson` runs on every render when
  search is active. Memoize based on the query + data hash.

---

## 6. Accessibility

- [ ] **ARIA labels on all interactive elements** — Toolbar buttons, tabs,
  search input, and tree nodes need descriptive labels for screen readers.
- [ ] **Focus management** — After loading JSON, focus should move to the
  viewer panel. After searching, focus should stay in the search bar.
- [ ] **Keyboard-only operation** — Every action should be reachable without
  a mouse. Tab order should be logical (input -> load -> viewer -> toolbar).
- [ ] **Color contrast** — Verify all text/background combinations meet WCAG
  AA in both light and dark themes. The current search highlight colors
  need auditing.
- [ ] **Tutorial and help text** - there could be some kind of tutorial or help 
  text that helps guide the user to know what features are availble but they dont 
  get in the way of the user. This should be thought out more

---

## What This List Is NOT

Referencing *Escaping the Build Trap* — the following are features that sound
valuable but would pull focus from the core loop. They belong in a "later"
backlog, not here:

- **JSON diff/compare** — Different product. Different user job.
- **JSON schema validation** — Useful but not core to "understand this JSON."
- **JSON editing/mutation** — This is a viewer, not an editor. Stay focused.
- **Export to YAML/CSV/XML** — Format conversion is a different tool.
- **Collaborative/shared sessions** — Adds massive complexity for niche use.
- **API testing / request builder** — That's Postman. Don't be Postman.
- **Saved documents / history** — Nice-to-have, not core to understanding JSON.

> "When companies don't understand their customers' problems well enough,
> they build feature factories." — Stay focused on the outcome: **the user
> understands their JSON, fast.**

---

## Prioritization Guide

**Done** (shipped):
1. ~~Syntax highlighting in code view (2.2)~~
2. ~~Click-to-copy JSON path (2.1)~~
3. ~~Search in code view (3)~~
4. ~~Error boundary + parse error positions (4)~~
5. ~~Auto-parse on paste (1.1)~~
6. ~~Navigate between search matches (3)~~
7. ~~Support JSONC (1.1)~~
8. ~~Show data types visually in tree view (2.1)~~
9. ~~Array length / object key count on collapse (2.1)~~
10. ~~Click-to-copy value (2.1)~~

**Do next** (polish and reliability):
11. Virtualize tree/code for large files (5)
12. ARIA labels and keyboard nav (6, 2.1)

**Do third** (quality of life):
13. Breadcrumb path bar (2.3)
14. Recent URLs (1.3)
15. File size validation on upload (1.2)
16. Regex search (3)
17. Web Worker parsing (5)
