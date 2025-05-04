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

  constructor(maxDepth: number) {
    this.root = new TrieNode();
    this.maxDepth = maxDepth;
  }

  insert(word: string): void {
    let current = this.root;

    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }

    current.isEndOfWord = true;
  }

  search(word: string): boolean {
    let current = this.root;

    for (const char of word) {
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

    for (const char of prefix) {
      if (!current.children.has(char)) {
        return result;
      }
      current = current.children.get(char)!;
    }

    this._findAllWords(current, prefix, result, limit);

    return result;
  }

  private _findAllWords(
    node: TrieNode,
    prefix: string,
    result: string[],
    limit: number
  ): void {
    if (result.length >= limit) {
      return;
    }

    if (node.isEndOfWord) {
      result.push(prefix);
    }

    for (const [char, childNode] of node.children.entries()) {
      this._findAllWords(childNode, prefix + char, result, limit);
    }
  }

  generateSuggestions(prefix: string, count: number = 5): string[] {
    const exactMatches = this.findWordsWithPrefix(prefix, count);

    if (exactMatches.length >= count) {
      return exactMatches.slice(0, count);
    }

    const suggestions = [...exactMatches];

    if (suggestions.length < count) {
      for (let i = 1; suggestions.length < count && i <= 100; i++) {
        const suggestion = `${prefix}${i}`;
        if (!this.search(suggestion)) {
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions;
  }
}

let trieInstance: Trie;

export function initTrie(): Trie {
  if (!trieInstance) {
    trieInstance = new Trie(config.trie.maxDepth);
    console.log("Trie initialized");
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
  console.debug(`Added "${username}" to Trie`);
}

export function checkUsernameInTrie(username: string): boolean {
  const trie = getTrie();
  const exists = trie.search(username.toLowerCase());
  console.debug(
    `Trie check for "${username}": ${exists ? "exists" : "not found"}`
  );
  return exists;
}

export function generateUsernameSuggestions(
  prefix: string,
  count: number = 5
): string[] {
  const trie = getTrie();
  const suggestions = trie.generateSuggestions(prefix.toLowerCase(), count);
  console.debug(
    `Generated ${suggestions.length} suggestions for prefix "${prefix}"`
  );
  return suggestions;
}
