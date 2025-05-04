export interface Username {
  username: string;
  created_at: Date;
  status: "active" | "inactive" | "banned";
}

export interface UsernameCheckResult {
  username: string;
  available: boolean;
  source: "bloom_filter" | "redis_cache" | "trie" | "database";
  suggestions?: string[];
  checkTimeMs: number;
}
