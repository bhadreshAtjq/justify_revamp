import { ethers } from "ethers";
import AnchorStoreABI from "./abi/AnchorStore.json";

// Network Configuration
const RPC_URL = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/";
const CONTRACT_ADDRESS = process.env.ANCHOR_STORE_ADDRESS || "";

// Initialize Provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Initialize Signers
const issuerSigner = process.env.PRIVATE_KEY_ISSUER 
  ? new ethers.Wallet(process.env.PRIVATE_KEY_ISSUER, provider)
  : null;

const workerSigner = process.env.PRIVATE_KEY_WORKER
  ? new ethers.Wallet(process.env.PRIVATE_KEY_WORKER, provider)
  : null;

// Initialize Contract
const anchorStore = new ethers.Contract(CONTRACT_ADDRESS, AnchorStoreABI, provider);

/**
 * Anchor a single document hash on the blockchain.
 * Uses the Worker role.
 */
export async function anchorDocument(docHash: string) {
  if (!workerSigner) throw new Error("Worker private key not configured");
  
  const contract = anchorStore.connect(workerSigner) as any;
  const hash = docHash.startsWith("0x") ? docHash : `0x${docHash}`;
  
  const tx = await contract.anchor(hash);
  const receipt = await tx.wait();
  
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    status: "confirmed"
  };
}

/**
 * Anchor a Merkle Root using the worker's anchorBatch function.
 * This is the most reliable way to anchor a root without protocol-specific metadata.
 * Uses the Worker role.
 */
export async function anchorMerkleRoot(merkleRoot: string) {
  if (!workerSigner) throw new Error("Worker private key not configured");
  
  const contract = anchorStore.connect(workerSigner) as any;
  const root = merkleRoot.startsWith("0x") ? merkleRoot : `0x${merkleRoot}`;
  
  console.log("Anchoring Root with anchorBatch:", root);

  // Using anchorBatch for maximum reliability and simplicity
  const tx = await contract.anchorBatch([root]);
  const receipt = await tx.wait();
  
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    status: "confirmed"
  };
}

/**
 * Verify a document hash against the blockchain.
 */
export async function verifyOnChain(docHash: string) {
  const hash = docHash.startsWith("0x") ? docHash : `0x${docHash}`;
  
  // Returns [anchored (bool), revoked (bool), blockNumber (uint256)]
  const result = await anchorStore.isAnchored(hash);
  
  return {
    anchored: result[0],
    revoked: result[1],
    blockNumber: result[2].toString(),
    valid: result[0] && !result[1]
  };
}

/**
 * Revoke a document hash.
 */
export async function revokeOnChain(docHash: string, reason: string) {
  if (!issuerSigner) throw new Error("Issuer private key not configured");
  
  const contract = anchorStore.connect(issuerSigner) as any;
  const hash = docHash.startsWith("0x") ? docHash : `0x${docHash}`;
  
  const tx = await contract.revoke(hash, reason);
  const receipt = await tx.wait();
  
  return receipt.hash;
}
