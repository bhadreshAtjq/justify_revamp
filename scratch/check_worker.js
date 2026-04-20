const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const ABI = JSON.parse(fs.readFileSync("./lib/abi/AnchorStore.json", "utf8"));
const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
const contract = new ethers.Contract(process.env.ANCHOR_STORE_ADDRESS, ABI, provider);

async function main() {
    const workerAddress = "0x5f21280A40e6FFf3B0C24943a8d36e93AF61d097";
    const ISSUER_ROLE = ethers.id("ISSUER_ROLE");
    const WORKER_ROLE = ethers.id("WORKER_ROLE");

    console.log("Checking Worker:", workerAddress);
    console.log("Has ISSUER_ROLE?", await contract.hasRole(ISSUER_ROLE, workerAddress));
    console.log("Has WORKER_ROLE?", await contract.hasRole(WORKER_ROLE, workerAddress));
}

main();
