# QuestVerify Smart Contract Integration Guide

This guide describes how to integrate the QuestVerify smart contracts into your backend application using Node.js and `ethers.js`, utilizing private keys directly from environment variables.

## 📋 Prerequisites

- **Node.js**: v18+ 
- **ethers.js**: v6.x
- **dotenv**: To manage environment variables

```bash
yarn add ethers dotenv
```

## ⚙️ Configuration (.env)

Ensure your `.env` file contains the correct RPC URL and private keys. 

```env
# Network Configuration
AMOY_RPC_URL=https://rpc-amoy.polygon.technology/

# Private Keys (Direct Access)
# Ensure these are kept secret in production!
PRIVATE_KEY_ADMIN=f0ef52ede49aca81e631398943c927c6396021bf80650530f78050338771d77d
PRIVATE_KEY_ISSUER=c8973b1ed00f273c53ffd218cde92edcb088acfe17eee76b3847b5cd931cfc5c
PRIVATE_KEY_WORKER=f82471fa576f353030f455f4745858a93bf48bd4589c62ae1098087245551c63

# Wallet Addresses (Reference)
# Admin (Deployer): 0x9868313d1451E5E446A00D163192E285388545e0
# Issuer: 0x7cF14A854456f6D6C2d5e2012A967E1a66BD3a21
# Worker: 0x5f21280A40e6FFf3B0C24943a8d36e93AF61d097

# Contract Address
ANCHOR_STORE_ADDRESS=0x129F583b90917db0614b03De609F2DE615CE0e78
```

## 🛠️ Integration Code

Create a file (e.g., `questverify.js`) to handle the blockchain interactions.

### 1. Initialize Provider and Signers

```javascript
const { ethers } = require("ethers");
require("dotenv").config();

// 1. Setup Provider
const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);

// 2. Setup Signers (direct access via private keys)
const adminSigner = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, provider);
const issuerSigner = new ethers.Wallet(process.env.PRIVATE_KEY_ISSUER, provider);
const workerSigner = new ethers.Wallet(process.env.PRIVATE_KEY_WORKER, provider);

// 3. Load ABI (You can import the JSON directly)
// Note: In a production backend, you might want to save the ABI to a separate JSON file
const AnchorStoreABI = require("./artifacts/contracts/AnchorStore.sol/AnchorStore.json").abi;

// 4. Initialize Contract Instance
const anchorStore = new ethers.Contract(
  process.env.ANCHOR_STORE_ADDRESS,
  AnchorStoreABI,
  provider
);

// Helper to get contract connected to a specific signer
const getContractFor = (signer) => anchorStore.connect(signer);
```

### 3. Smart Contract ABI

The full ABI can be imported from the `artifacts` directory as shown above. Below is the ABI JSON for `AnchorStore` which you can also copy directly if needed for your frontend or external services.

<details>
<summary><b>Click to expand AnchorStore ABI JSON</b></summary>

```json
[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "admin",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AlreadyVoted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AlreadyVouched",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ArraysLengthMismatch",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ECDSAInvalidSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "length",
        "type": "uint256"
      }
    ],
    "name": "ECDSAInvalidSignatureLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "ECDSAInvalidSignatureS",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyArray",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidCanonicalForm",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidMerkleProof",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidNonce",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidPublicKey",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSignature",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTimeWindow",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IssuerAlreadyRegistered",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IssuerNotActive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IssuerNotRegistered",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoRecoveryGuardians",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotGuardian",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotWitness",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PublicKeyAlreadyInUse",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RootAlreadyBound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RootAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnauthorizedIssuerOperation",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnauthorizedKeyRoll",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "certHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "Anchored",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "activatedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "IssuerActivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "deactivatedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "IssuerDeactivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldSigningAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newSigningAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recoveredBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "IssuerKeyRecovered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldSigningAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newSigningAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "rolledBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "IssuerKeyRolled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "uri",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "updatedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "IssuerMetadataURIUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "signingAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "IssuerRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "witness",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "IssuerVouched",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "timeWindow",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "root",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "MerkleRootSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newMinBalance",
        "type": "uint256"
      }
    ],
    "name": "MinWorkerBalanceSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "guardians",
        "type": "address[]"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "setBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "RecoveryGuardiansSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "certHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "Revoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "root",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "RootRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "start",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "end",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "invalidatedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "TimeWindowInvalidated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "witness",
        "type": "address"
      }
    ],
    "name": "WitnessAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "witness",
        "type": "address"
      }
    ],
    "name": "WitnessRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "worker",
        "type": "address"
      }
    ],
    "name": "WorkerAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "worker",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "WorkerRefilled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "worker",
        "type": "address"
      }
    ],
    "name": "WorkerRemoved",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ISSUER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WITNESS_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WORKER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      }
    ],
    "name": "activateIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "witness",
        "type": "address"
      }
    ],
    "name": "addWitness",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "worker",
        "type": "address"
      }
    ],
    "name": "addWorker",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "addressToIssuer",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "certHash",
        "type": "bytes32"
      }
    ],
    "name": "anchor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32[]",
        "name": "certHashes",
        "type": "bytes32[]"
      }
    ],
    "name": "anchorBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "anchoredAt",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "canonicalizationVersion",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "deactivateIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      }
    ],
    "name": "getIssuer",
    "outputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "signingAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "registeredAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "signingAddress",
        "type": "address"
      }
    ],
    "name": "getIssuerBySigningAddress",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      }
    ],
    "name": "getRecoveryGuardians",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "guardians",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "timeWindow",
        "type": "uint256"
      }
    ],
    "name": "getRootStatus",
    "outputs": [
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      },
      {
        "internalType": "bytes32",
        "name": "root",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "isRevoked",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      }
    ],
    "name": "getSigningAddressHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "signingAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "validFrom",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "validUntil",
            "type": "uint256"
          }
        ],
        "internalType": "struct AnchorStoreIssuer.SigningAddressHistory[]",
        "name": "history",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      }
    ],
    "name": "getTimeWindowInvalidations",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "start",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "end",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "invalidatedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct AnchorStoreTimeWindow.TimeWindow[]",
        "name": "invalidations",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      }
    ],
    "name": "getVouchCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "count",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      }
    ],
    "name": "getVouches",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "witness",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "issuerId",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct AnchorStoreRoles.Vouch[]",
        "name": "issuerVouches",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "guardianVotes",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "guardian",
        "type": "address"
      }
    ],
    "name": "hasGuardianVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "hasVoted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasVouched",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "start",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "end",
        "type": "uint256"
      }
    ],
    "name": "invalidateTimeWindow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "certHash",
        "type": "bytes32"
      }
    ],
    "name": "isAnchored",
    "outputs": [
      {
        "internalType": "bool",
        "name": "anchored",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "revokedStatus",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "certHash",
        "type": "bytes32"
      }
    ],
    "name": "isRevoked",
    "outputs": [
      {
        "internalType": "bool",
        "name": "revokedStatus",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "isTimeWindowInvalidated",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isInvalidated",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "issuerDeactivationReason",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "issuerMetadataURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "issuerRootNonce",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "issuers",
    "outputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "signingAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "registeredAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "merkleRoots",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "timeWindow",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "merkleRoot",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "diHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "metadata",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "expectedCanonicalHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      }
    ],
    "name": "putRoot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "timeWindow",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "merkleRoot",
        "type": "bytes32"
      }
    ],
    "name": "putRootLegacy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "newSigningAddress",
        "type": "address"
      }
    ],
    "name": "recoverIssuerKey",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "recoveryGuardians",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "signingAddress",
        "type": "address"
      }
    ],
    "name": "registerIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "witness",
        "type": "address"
      }
    ],
    "name": "removeWitness",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "worker",
        "type": "address"
      }
    ],
    "name": "removeWorker",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "certHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "revoke",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32[]",
        "name": "certHashes",
        "type": "bytes32[]"
      },
      {
        "internalType": "string[]",
        "name": "reasons",
        "type": "string[]"
      }
    ],
    "name": "revokeBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "root",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "revokeRoot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "revoked",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "revokedRoots",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "newSigningAddress",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "messageHash",
        "type": "bytes32"
      }
    ],
    "name": "rollKey",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "rootIssuer",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newVersion",
        "type": "uint256"
      }
    ],
    "name": "setCanonicalizationVersion",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "uri",
        "type": "string"
      }
    ],
    "name": "setIssuerMetadataURI",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "address[]",
        "name": "guardians",
        "type": "address[]"
      }
    ],
    "name": "setRecoveryGuardians",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "signingAddressHistory",
    "outputs": [
      {
        "internalType": "address",
        "name": "signingAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "validFrom",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "validUntil",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "timeWindowInvalidations",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "start",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "end",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "invalidatedAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "leaf",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32[]",
        "name": "mpiProof",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "mpuProof",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32",
        "name": "mri",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "mru",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "timeWindow",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "diHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "siSignature",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "issuanceTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "Ed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "Ei",
        "type": "uint256"
      }
    ],
    "name": "verifyDocument",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "leaf",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32[]",
        "name": "mpiProof",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "mpuProof",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32",
        "name": "mri",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "mru",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "timeWindow",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      }
    ],
    "name": "verifyDocumentSimple",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "vouch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "vouches",
    "outputs": [
      {
        "internalType": "address",
        "name": "witness",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "issuerId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]
```

</details>

// Helper to get contract connected to a specific signer
const getContractFor = (signer) => anchorStore.connect(signer);
```

### 2. Common Operations

#### A. Single Document Anchoring
Used for anchoring a single unique document hash.

```javascript
async function anchorDocument(docHash) {
    try {
        console.log(`Anchoring: ${docHash}`);
        // Use worker signer for daily operations
        const contract = getContractFor(workerSigner);
        
        const tx = await contract.anchor(docHash);
        const receipt = await tx.wait();
        
        console.log(`✅ Anchored in block: ${receipt.blockNumber}`);
        return receipt.hash;
    } catch (error) {
        console.error("Anchoring failed:", error);
    }
}
```

#### B. Batch Anchoring
More gas-efficient for multiple documents.

```javascript
async function anchorBatch(hashes) {
    const contract = getContractFor(workerSigner);
    const tx = await contract.anchorBatch(hashes);
    await tx.wait();
    console.log("✅ Batch anchored successfully");
}
```

#### C. Merkle Root (MRU) Anchoring
Used for massive amounts of documents (e.g., thousands) by only storing the root.

```javascript
async function anchorMerkleRoot(merkleRoot) {
    const contract = getContractFor(issuerSigner);
    // Anchor for the current time window
    const tx = await contract.putRoot(merkleRoot);
    await tx.wait();
    console.log("✅ Merkle Root anchored");
}
```

#### D. Revocation
Mark a previous anchor as invalid.

```javascript
async function revokeDocument(docHash, reason) {
    const contract = getContractFor(issuerSigner);
    const tx = await contract.revoke(docHash, reason);
    await tx.wait();
    console.log(`✅ Document revoked for reason: ${reason}`);
}
```

#### E. Verification (ReadOnly)
Can be called without a signer (using provider).

```javascript
async function verifyDocument(docHash) {
    const [isAnchored, isRevoked, blockNumber] = await anchorStore.isAnchored(docHash);
    
    return {
        valid: isAnchored && !isRevoked,
        anchored: isAnchored,
        revoked: isRevoked,
        block: blockNumber.toString()
    };
}
```

## 🔒 Security Best Practices

1. **Environment Security**: Never commit your `.env` file. Use secrets management (AWS Secrets Manager, GCP Secret Manager) in production.
2. **Gas Management**: Polygon Amoy gas prices can fluctuate. Ethers v6 handles `feeData` automatically, but you can override if needed:
   ```javascript
   const tx = await contract.anchor(hash, { 
       maxFeePerGas: ethers.parseUnits("50", "gwei"),
       maxPriorityFeePerGas: ethers.parseUnits("30", "gwei")
   });
   ```
3. **Error Handling**: Always use `try/catch` and check for transaction replacement or gas price issues.

## 🔍 Verification on PolygonScan
You can view your transactions on the Amoy Explorer:
[https://amoy.polygonscan.com/address/0x129F583b90917db0614b03De609F2DE615CE0e78](https://amoy.polygonscan.com/address/0x129F583b90917db0614b03De609F2DE615CE0e78)
