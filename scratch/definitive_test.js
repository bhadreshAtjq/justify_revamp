// Definitive comparison: js-sha3 vs web3 vs the target hash
const jsSha3 = require('js-sha3');
const { Web3 } = require('web3');
const web3 = new Web3();

const jsonString = '{"registration_no":"20174304","name":"Ramesh Agarwal","gpa":"6.41","subjects":[{"code":"ABM 517","title":"AGRICULTURAL MARKETING MANAGEMENT","credits":"2","grade":"6.7"},{"code":"ABM 521","title":"FARM BUSINESS MANAGEMENT","credits":"2","grade":"6.1"},{"code":"ABM 526","title":"INTERNATIONAL TRADE & SUSTAINABILITY","credits":"2","grade":"6.2"},{"code":"ABM 528","title":"GOVERNANCE","credits":"2","grade":"5.9"},{"code":"ABM 530","title":"AGRIBUSINESS FINANCIAL MANAGEMENT","credits":"2","grade":"7.0"},{"code":"ABM 532","title":"MANAGEMENT OF AGRICULTURAL INPUT MARKETING","credits":"2","grade":"5.6"},{"code":"ABM 537","title":"AGRI-SUPPLY CHAIN MANAGEMENT","credits":"2","grade":"6.8"},{"code":"ABM 537","title":"COMMODITY-FUTURE MARKETS AND DERIVATIVES","credits":"2","grade":"6.7"},{"code":"PGS 505","title":"DISASTER MANAGEMENT","credits":"1","grade":"6.9"}]}';

const targetHash = "0xb9227f3c5d48d9213f7decca1c753a14a3910af17c0bbda8ab7a3c6db2484811";

// Method 1: js-sha3 (raw hex, no 0x)
const hash1 = "0x" + jsSha3.keccak256(jsonString);

// Method 2: web3.utils.keccak256 (auto-handles UTF-8)
const hash2 = web3.utils.keccak256(jsonString);

// Method 3: web3 with explicit utf8ToHex first
const hexPayload = web3.utils.utf8ToHex(jsonString);
const hash3 = web3.utils.keccak256(hexPayload);

console.log("Target (Python):       ", targetHash);
console.log("js-sha3:               ", hash1);
console.log("web3 direct:           ", hash2);
console.log("web3 utf8ToHex first:  ", hash3);
console.log("");
console.log("js-sha3 matches?       ", hash1 === targetHash);
console.log("web3 direct matches?   ", hash2 === targetHash);
console.log("web3 hex-first matches?", hash3 === targetHash);
console.log("");
console.log("String length:", jsonString.length);
console.log("First 80 chars:", JSON.stringify(jsonString.substring(0, 80)));
console.log("Last 20 chars:", JSON.stringify(jsonString.substring(jsonString.length - 20)));

// Also check byte-level representation
const encoder = new TextEncoder();
const bytes = encoder.encode(jsonString);
console.log("Byte length:", bytes.length);
