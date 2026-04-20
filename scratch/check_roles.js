const { ethers } = require("ethers");

console.log("DEFAULT_ADMIN_ROLE:", ethers.ZeroHash);
console.log("ISSUER_ROLE:", ethers.id("ISSUER_ROLE"));
console.log("WITNESS_ROLE:", ethers.id("WITNESS_ROLE"));
console.log("WORKER_ROLE:", ethers.id("WORKER_ROLE"));
