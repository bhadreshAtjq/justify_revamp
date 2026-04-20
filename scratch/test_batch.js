const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const ABI = JSON.parse(fs.readFileSync("./lib/abi/AnchorStore.json", "utf8"));
const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
const workerWallet = new ethers.Wallet(process.env.PRIVATE_KEY_WORKER, provider);
const contract = new ethers.Contract(process.env.ANCHOR_STORE_ADDRESS, ABI, workerWallet);

const root = "0xd4eea8bbca86fb0ce22d7b1653781f4d83dc3952ebdf15affe46615f4271dcb5";

async function main() {
    try {
        console.log("Testing anchorBatch([root])...");
        const gas = await contract.anchorBatch.estimateGas([root]);
        console.log("  ✅ SUCCESS! Gas:", gas.toString());
    } catch (e) {
        console.log("  ❌ FAILED:", e.message);
    }
}

main();
