// Verify the normalized hash matches Python's output
const jsSha3 = require('js-sha3');

const regNo = "20174304";
const name = "Ramesh Agarwal";
const gpa = "6.41";
const subjects = [
  { code: "ABM 517", title: "AGRICULTURAL MARKETING MANAGEMENT", credits: "2", grade: "6.7" },
  { code: "ABM 521", title: "FARM BUSINESS MANAGEMENT", credits: "2", grade: "6.1" },
  { code: "ABM 526", title: "INTERNATIONAL TRADE & SUSTAINABILITY", credits: "2", grade: "6.2" },
  { code: "ABM 528", title: "GOVERNANCE", credits: "2", grade: "5.9" },
  { code: "ABM 530", title: "AGRIBUSINESS FINANCIAL MANAGEMENT", credits: "2", grade: "7.0" },
  { code: "ABM 532", title: "MANAGEMENT OF AGRICULTURAL INPUT MARKETING", credits: "2", grade: "5.6" },
  { code: "ABM 537", title: "AGRI-SUPPLY CHAIN MANAGEMENT", credits: "2", grade: "6.8" },
  { code: "ABM 537", title: "COMMODITY-FUTURE MARKETS AND DERIVATIVES", credits: "2", grade: "6.7" },
  { code: "PGS 505", title: "DISASTER MANAGEMENT", credits: "1", grade: "6.9" }
];

// Replicate Python's normalize_for_hash exactly
const parts = [];
parts.push(regNo.trim());
parts.push(name.trim());

// Sort by (code, title)
const sortedSubs = [...subjects].sort((a, b) => {
  const codeCompare = a.code.localeCompare(b.code);
  if (codeCompare !== 0) return codeCompare;
  return a.title.localeCompare(b.title);
});

for (const s of sortedSubs) {
  parts.push(`${s.code}${s.title}${s.grade}${s.credits}`);
}

parts.push(gpa.trim());

const normalized = parts.join("|").toLowerCase();

console.log("Normalized string:");
console.log(normalized);
console.log("");
console.log("Hash: 0x" + jsSha3.keccak256(normalized));
console.log("Target: 0xb9227f3c5d48d9213f7decca1c753a14a3910af17c0bbda8ab7a3c6db2484811");
console.log("Match:", "0x" + jsSha3.keccak256(normalized) === "0xb9227f3c5d48d9213f7decca1c753a14a3910af17c0bbda8ab7a3c6db2484811");
