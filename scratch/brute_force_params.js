const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const ABI = JSON.parse(fs.readFileSync("./lib/abi/AnchorStore.json", "utf8"));
const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
const workerWallet = new ethers.Wallet(process.env.PRIVATE_KEY_WORKER, provider);
const contract = new ethers.Contract(process.env.ANCHOR_STORE_ADDRESS, ABI, workerWallet);

const issuerId = "0x5d32f6de7c2c5b6537ec244ae30f39a5f5884666405a641a276ea584f8c1390e";
const root = "0xd4eea8bbca86fb0ce22d7b1653781f4d83dc3952ebdf15affe46615f4271dcb5";

async function test(timeWindow, nonce, expectedCanonicalHash) {
    try {
        console.log(`Testing: Window=${timeWindow}, Nonce=${nonce}, ExpectedHash=${expectedCanonicalHash.slice(0, 10)}...`);
        const gas = await contract.putRoot.estimateGas(
            timeWindow,
            root,
            issuerId,
            ethers.ZeroHash,
            "0x",
            expectedCanonicalHash,
            nonce
        );
        console.log("  ✅ SUCCESS! Gas:", gas.toString());
        return true;
    } catch (e) {
        let errorName = "Unknown Error";
        if (e.data) {
            try {
                const decoded = contract.interface.parseError(e.data);
                errorName = decoded.name;
            } catch (inner) {}
        } else if (e.message) {
            if (e.message.includes("InvalidNonce")) errorName = "InvalidNonce";
            if (e.message.includes("InvalidTimeWindow")) errorName = "InvalidTimeWindow";
        }
        console.log(`  ❌ FAILED: ${errorName}`);
        return false;
    }
}

async function main() {
    const currentNonce = await contract.issuerRootNonce(issuerId);
    console.log("Current on-chain nonce:", currentNonce.toString());

    const windows = [
        Math.floor(Date.now() / (86400 * 1000)), // Daily
        Math.floor(Date.now() / 1000),           // Seconds (Timestamp)
        1,                                      // Fixed small
        0                                       // Zero
    ];

    const nonces = [currentNonce, currentNonce + 1n, 1n, 0n];

    for (const tw of windows) {
        for (const n of nonces) {
            if (await test(tw, n, root)) {
                console.log("FOUND WORKING COMBO!");
                return;
            }
        }
    }
}

main();
