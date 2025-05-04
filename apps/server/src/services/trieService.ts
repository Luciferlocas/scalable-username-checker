import { config } from "../config/config";

class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;

  constructor() {
    this.children = new Map<string, TrieNode>();
    this.isEndOfWord = false;
  }
}

class Trie {
  root: TrieNode;
  maxDepth: number;
  count: number;

  constructor(maxDepth: number) {
    this.root = new TrieNode();
    this.maxDepth = maxDepth;
    this.count = 0;
  }

  insert(word: string): void {
    let current = this.root;
    const normalizedWord = word.toLowerCase();

    for (const char of normalizedWord) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }

    if (!current.isEndOfWord) {
      this.count++;
    }
    current.isEndOfWord = true;
  }

  search(word: string): boolean {
    let current = this.root;
    const normalizedWord = word.toLowerCase();

    for (const char of normalizedWord) {
      if (!current.children.has(char)) {
        return false;
      }
      current = current.children.get(char)!;
    }

    return current.isEndOfWord;
  }

  findWordsWithPrefix(prefix: string, limit: number = 5): string[] {
    const result: string[] = [];
    let current = this.root;
    const normalizedPrefix = prefix.toLowerCase();

    for (const char of normalizedPrefix) {
      if (!current.children.has(char)) {
        return result;
      }
      current = current.children.get(char)!;
    }

    this._findAllWords(current, normalizedPrefix, result, limit);
    return result;
  }

  private _findAllWords(
    node: TrieNode,
    prefix: string,
    result: string[],
    limit: number,
  ): void {
    if (result.length >= limit) {
      return;
    }

    if (node.isEndOfWord) {
      result.push(prefix);
    }

    const sortedEntries = Array.from(node.children.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );

    for (const [char, childNode] of sortedEntries) {
      if (prefix.length < this.maxDepth) {
        this._findAllWords(childNode, prefix + char, result, limit);
      }
    }
  }

  generateSuggestions(prefix: string, count: number = 5): string[] {
    const normalizedPrefix = prefix.toLowerCase();
    const suggestions: string[] = [];
    const used = new Set<string>();

    const randomWords = [
      "dev",
      "xyz",
      "pro",
      "hub",
      "io",
      "bot",
      "base",
      "site",
      "web",
      "labs",
      "plus",
      "net",
      "cloud",
      "zone",
      "app",
    ];

    const tryAdd = (suggestion: string) => {
      if (!this.search(suggestion) && !used.has(suggestion)) {
        suggestions.push(suggestion);
        used.add(suggestion);
      }
    };

    const shuffle = <T>(array: T[]): T[] =>
      array.sort(() => Math.random() - 0.5);

    for (const word of shuffle(randomWords)) {
      if (suggestions.length >= count) break;
      tryAdd(`${normalizedPrefix}${word}`);
      tryAdd(`${word}${normalizedPrefix}`);
      tryAdd(`${normalizedPrefix}_${word}`);
    }

    let attempts = 0;
    while (suggestions.length < count && attempts < 100) {
      const rand = Math.floor(Math.random() * 9999);
      tryAdd(`${normalizedPrefix}${rand}`);
      attempts++;
    }

    const letters = "abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < letters.length && suggestions.length < count; i++) {
      tryAdd(`${normalizedPrefix}${letters[i]}`);
    }

    tryAdd(`${normalizedPrefix}_`);

    return suggestions.slice(0, count);
  }

  getCount(): number {
    return this.count;
  }
}

let trieInstance: Trie;

export function initTrie(): Trie {
  if (!trieInstance) {
    trieInstance = new Trie(config.trie.maxDepth);
    console.log("Trie initialized with max depth:", config.trie.maxDepth);
  }
  return trieInstance;
}

export function getTrie(): Trie {
  if (!trieInstance) {
    return initTrie();
  }
  return trieInstance;
}

export function addUsernameToTrie(username: string): void {
  const trie = getTrie();
  trie.insert(username.toLowerCase());
  console.debug(
    `Added "${username}" to Trie. Total usernames in Trie: ${trie.getCount()}`,
  );
}

export function checkUsernameInTrie(username: string): boolean {
  const trie = getTrie();
  const exists = trie.search(username.toLowerCase());
  console.debug(
    `Trie check for "${username}": ${exists ? "exists" : "not found"}`,
  );
  return exists;
}

export function generateUsernameSuggestions(
  prefix: string,
  count: number = 5,
): string[] {
  const trie = getTrie();
  const normalizedPrefix = prefix.toLowerCase();
  const suggestions = trie.generateSuggestions(normalizedPrefix, count);
  console.debug(
    `Generated ${suggestions.length} suggestions for prefix "${prefix}": ${suggestions.join(", ")}`,
  );
  return suggestions;
}
