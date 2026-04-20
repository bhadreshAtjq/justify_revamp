import { MerkleTree } from "merkletreejs";
import { keccak256 } from "js-sha3";

/**
 * Keccak256 hash function for MerkleTree library
 */
function hasher(data: string | Buffer): Buffer {
  // merkletreejs passes Buffer in internally for comparisons
  const input = typeof data === "string" ? data : data.toString("hex");
  const hash = keccak256(input);
  return Buffer.from(hash, "hex");
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
  const leaves = leafHashes.map((h) => Buffer.from(h, "hex"));
  
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
  const leaf = Buffer.from(leafHash, "hex");
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
  const leaf = Buffer.from(leafHash, "hex");
  const proof = tree.getProof(leaf);
  return tree.verify(proof, leaf, root);
}
