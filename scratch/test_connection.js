const { ethers } = require("ethers");
require("dotenv").config();

async function testConnection() {
  const rpcUrl = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  try {
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name, "ChainID:", network.chainId.toString());

    const workerKey = process.env.PRIVATE_KEY_WORKER;
    if (!workerKey) {
      console.error("PRIVATE_KEY_WORKER is missing in .env");
      return;
    }

    const wallet = new ethers.Wallet(workerKey, provider);
    console.log("Worker Address:", wallet.address);

    const balance = await provider.getBalance(wallet.address);
    console.log("Worker Balance:", ethers.formatEther(balance), "MATIC");

    if (parseFloat(ethers.formatEther(balance)) === 0) {
      console.warn("WARNING: Worker has 0 MATIC. Anchoring will fail due to no gas.");
    }
    
    const contractAddress = process.env.ANCHOR_STORE_ADDRESS;
    console.log("Contract Address:", contractAddress);
    
    if (!contractAddress) {
      console.error("ANCHOR_STORE_ADDRESS is missing in .env");
    }

  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

testConnection();
