"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTrie = initTrie;
exports.getTrie = getTrie;
exports.addUsernameToTrie = addUsernameToTrie;
exports.checkUsernameInTrie = checkUsernameInTrie;
exports.generateUsernameSuggestions = generateUsernameSuggestions;
const config_1 = require("../config/config");
class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
    }
}
class Trie {
    constructor(maxDepth) {
        this.root = new TrieNode();
        this.maxDepth = maxDepth;
        this.count = 0;
    }
    insert(word) {
        let current = this.root;
        const normalizedWord = word.toLowerCase();
        for (const char of normalizedWord) {
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }
            current = current.children.get(char);
        }
        if (!current.isEndOfWord) {
            this.count++;
        }
        current.isEndOfWord = true;
    }
    search(word) {
        let current = this.root;
        const normalizedWord = word.toLowerCase();
        for (const char of normalizedWord) {
            if (!current.children.has(char)) {
                return false;
            }
            current = current.children.get(char);
        }
        return current.isEndOfWord;
    }
    findWordsWithPrefix(prefix, limit = 5) {
        const result = [];
        let current = this.root;
        const normalizedPrefix = prefix.toLowerCase();
        for (const char of normalizedPrefix) {
            if (!current.children.has(char)) {
                return result;
            }
            current = current.children.get(char);
        }
        this._findAllWords(current, normalizedPrefix, result, limit);
        return result;
    }
    _findAllWords(node, prefix, result, limit) {
        if (result.length >= limit) {
            return;
        }
        if (node.isEndOfWord) {
            result.push(prefix);
        }
        const sortedEntries = Array.from(node.children.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [char, childNode] of sortedEntries) {
            if (prefix.length < this.maxDepth) {
                this._findAllWords(childNode, prefix + char, result, limit);
            }
        }
    }
    generateSuggestions(prefix, count = 5) {
        const normalizedPrefix = prefix.toLowerCase();
        const suggestions = [];
        const used = new Set();
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
        const tryAdd = (suggestion) => {
            if (!this.search(suggestion) && !used.has(suggestion)) {
                suggestions.push(suggestion);
                used.add(suggestion);
            }
        };
        const shuffle = (array) => array.sort(() => Math.random() - 0.5);
        for (const word of shuffle(randomWords)) {
            if (suggestions.length >= count)
                break;
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
    getCount() {
        return this.count;
    }
}
let trieInstance;
function initTrie() {
    if (!trieInstance) {
        trieInstance = new Trie(config_1.config.trie.maxDepth);
        console.log("Trie initialized with max depth:", config_1.config.trie.maxDepth);
    }
    return trieInstance;
}
function getTrie() {
    if (!trieInstance) {
        return initTrie();
    }
    return trieInstance;
}
function addUsernameToTrie(username) {
    const trie = getTrie();
    trie.insert(username.toLowerCase());
    console.debug(`Added "${username}" to Trie. Total usernames in Trie: ${trie.getCount()}`);
}
function checkUsernameInTrie(username) {
    const trie = getTrie();
    const exists = trie.search(username.toLowerCase());
    console.debug(`Trie check for "${username}": ${exists ? "exists" : "not found"}`);
    return exists;
}
function generateUsernameSuggestions(prefix, count = 5) {
    const trie = getTrie();
    const normalizedPrefix = prefix.toLowerCase();
    const suggestions = trie.generateSuggestions(normalizedPrefix, count);
    console.debug(`Generated ${suggestions.length} suggestions for prefix "${prefix}": ${suggestions.join(", ")}`);
    return suggestions;
}
