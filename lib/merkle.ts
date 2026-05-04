import { MerkleTree } from "merkletreejs";
import { keccak256 } from "web3-utils";

/**
 * Keccak256 hash function for MerkleTree library
 */
function hasher(data: string | Buffer): Buffer {
  // web3-utils keccak256 handles strings, hex strings, and buffers correctly
  const hash = keccak256(data);
  const clean = hash.startsWith("0x") ? hash.slice(2) : hash;
  return Buffer.from(clean, "hex");
}

/**
 * Build a Merkle tree from an array of leaf hashes.
 * Returns the tree instance and the Merkle root.
 */
export function buildMerkleTree(leafHashes: string[]): {
  tree: MerkleTree;
  root: string;
  leaves: string[];
} {
  // Sort and unique for deterministic roots
  const leaves = leafHashes.map((h) => {
    const clean = h.startsWith("0x") ? h.slice(2) : h;
    return Buffer.from(clean, "hex");
  });
  
  const tree = new MerkleTree(leaves, hasher, {
    sortPairs: true,
  });
  
  const root = tree.getRoot().toString("hex");

  return { tree, root, leaves: leafHashes };
}

/**
 * Get Merkle proof for a specific leaf
 */
export function getMerkleProof(
  tree: MerkleTree,
  leafHash: string
): string[] {
  const clean = leafHash.startsWith("0x") ? leafHash.slice(2) : leafHash;
  const leaf = Buffer.from(clean, "hex");
  return tree.getProof(leaf).map((p) => p.data.toString("hex"));
}

/**
 * Verify a leaf against the Merkle root
 */
export function verifyLeaf(
  tree: MerkleTree,
  leafHash: string,
  root: string
): boolean {
  const clean = leafHash.startsWith("0x") ? leafHash.slice(2) : leafHash;
  const leaf = Buffer.from(clean, "hex");
  const proof = tree.getProof(leaf);
  return tree.verify(proof, leaf, root);
}
