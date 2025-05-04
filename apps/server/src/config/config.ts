export const config = {
  bloomFilter: {
    size: 10000,
    hashFunctions: 10,
  },
  trie: {
    maxDepth: 20,
  },
  loadBalancer: {
    strategy: "round-robin",
    servers: 3,
  },
};
