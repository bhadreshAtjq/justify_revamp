const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const ABI = JSON.parse(fs.readFileSync("./lib/abi/AnchorStore.json", "utf8"));
const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
const contract = new ethers.Contract(process.env.ANCHOR_STORE_ADDRESS, ABI, provider);

async function main() {
    const issuerAddress = "0x5f21280A40e6FFf3B0C24943a8d36e93AF61d097";
    console.log("Checking Issuer Account:", issuerAddress);

    try {
        // 1. Check Role
        const ISSUER_ROLE = await contract.ISSUER_ROLE();
        const hasRole = await contract.hasRole(ISSUER_ROLE, issuerAddress);
        console.log("Has ISSUER_ROLE?", hasRole);

        // 2. Check Registration
        const issuerId = await contract.getIssuerBySigningAddress(issuerAddress);
        console.log("Issuer ID from address:", issuerId);

        if (issuerId !== ethers.ZeroHash) {
            const data = await contract.getIssuer(issuerId);
            console.log("Issuer Data:", {
                owner: data[0],
                signingAddress: data[1],
                registeredAt: data[2].toString(),
                active: data[3]
            });
        } else {
            console.log("Issuer NOT REGISTERED in contract mapping!");
        }

    } catch (err) {
        console.error("Diagnostic failed:", err);
    }
}

main();
