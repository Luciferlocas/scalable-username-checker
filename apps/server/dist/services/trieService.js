"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTrie = initTrie;
exports.getTrie = getTrie;
exports.addUsernameToTrie = addUsernameToTrie;
exports.checkUsernameInTrie = checkUsernameInTrie;
exports.generateUsernameSuggestions = generateUsernameSuggestions;
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
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
    }
    insert(word) {
        let current = this.root;
        for (const char of word) {
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }
            current = current.children.get(char);
        }
        current.isEndOfWord = true;
    }
    search(word) {
        let current = this.root;
        for (const char of word) {
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
        for (const char of prefix) {
            if (!current.children.has(char)) {
                return result;
            }
            current = current.children.get(char);
        }
        this._findAllWords(current, prefix, result, limit);
        return result;
    }
    _findAllWords(node, prefix, result, limit) {
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
    generateSuggestions(prefix, count = 5) {
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
let trieInstance;
function initTrie() {
    if (!trieInstance) {
        trieInstance = new Trie(config_1.config.trie.maxDepth);
        logger_1.logger.info("Trie initialized");
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
    logger_1.logger.debug(`Added "${username}" to Trie`);
}
function checkUsernameInTrie(username) {
    const trie = getTrie();
    const exists = trie.search(username.toLowerCase());
    logger_1.logger.debug(`Trie check for "${username}": ${exists ? "exists" : "not found"}`);
    return exists;
}
function generateUsernameSuggestions(prefix, count = 5) {
    const trie = getTrie();
    const suggestions = trie.generateSuggestions(prefix.toLowerCase(), count);
    logger_1.logger.debug(`Generated ${suggestions.length} suggestions for prefix "${prefix}"`);
    return suggestions;
}
