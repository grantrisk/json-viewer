export interface JsonStore {
  rawJson: string;
  jsonData: unknown | null;
  error: string | null;
  isLoading: boolean;
}

export interface SearchMatch {
  path: string;
  key?: string;
  value?: string;
}
