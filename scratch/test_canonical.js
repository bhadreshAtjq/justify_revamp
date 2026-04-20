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
        const gas = await contract.putRoot.estimateGas(
            timeWindow,
            root,
            issuerId,
            ethers.ZeroHash,
            "0x",
            expectedCanonicalHash,
            nonce
        );
        return { success: true, gas: gas.toString() };
    } catch (e) {
        let errorName = "Unknown Error";
        if (e.data) {
            try {
                const decoded = contract.interface.parseError(e.data);
                errorName = decoded.name;
            } catch (inner) {}
        }
        return { success: false, error: errorName };
    }
}

async function main() {
    const nonceValue = 0n; // Try both 0 and 1
    const timeWindow = Math.floor(Date.now() / (86400 * 1000));

    console.log("Variations for Nonce 0:");
    console.log("  ExpectedHash=root:", await test(timeWindow, 0n, root));
    console.log("  ExpectedHash=Zero:", await test(timeWindow, 0n, ethers.ZeroHash));

    console.log("\nVariations for Nonce 1:");
    console.log("  ExpectedHash=root:", await test(timeWindow, 1n, root));
    console.log("  ExpectedHash=Zero:", await test(timeWindow, 1n, ethers.ZeroHash));
    
    // Try timestamp for nonce?
    const ts = BigInt(Math.floor(Date.now() / 1000));
    console.log("\nVariations for Nonce=Timestamp:");
    console.log("  Nonce=TS, ExpectedHash=root:", await test(timeWindow, ts, root));
    console.log("  Nonce=TS, ExpectedHash=Zero:", await test(timeWindow, ts, ethers.ZeroHash));
}

main();
