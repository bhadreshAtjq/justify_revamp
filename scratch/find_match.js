const { Web3 } = require('web3');
const web3 = new Web3();

const payload = {
  registration_no: "20174304",
  name: "Ramesh Agarwal",
  gpa: "6.41",
  subjects: [
    { code: "ABM 517", title: "AGRICULTURAL MARKETING MANAGEMENT", credits: "2", grade: "6.7" },
    { code: "ABM 521", title: "FARM BUSINESS MANAGEMENT", credits: "2", grade: "6.1" },
    { code: "ABM 526", title: "INTERNATIONAL TRADE & SUSTAINABILITY", credits: "2", grade: "6.2" },
    { code: "ABM 528", title: "GOVERNANCE", credits: "2", grade: "5.9" },
    { code: "ABM 530", title: "AGRIBUSINESS FINANCIAL MANAGEMENT", credits: "2", grade: "7.0" },
    { code: "ABM 532", title: "MANAGEMENT OF AGRICULTURAL INPUT MARKETING", credits: "2", grade: "5.6" },
    { code: "ABM 537", title: "AGRI-SUPPLY CHAIN MANAGEMENT", credits: "2", grade: "6.8" },
    { code: "ABM 537", title: "COMMODITY-FUTURE MARKETS AND DERIVATIVES", credits: "2", grade: "6.7" },
    { code: "PGS 505", title: "DISASTER MANAGEMENT", credits: "1", grade: "6.9" }
  ]
};

const keys = ["registration_no", "name", "gpa", "subjects"];

function getPermutations(arr) {
  if (arr.length <= 1) return [arr];
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    const char = arr[i];
    const remainingChars = arr.slice(0, i).concat(arr.slice(i + 1));
    const perms = getPermutations(remainingChars);
    for (let p of perms) {
      result.push([char, ...p]);
    }
  }
  return result;
}

const targetHash = "0xb9227f3c5d48d9213f7decca1c753a14a3910af17c0bbda8ab7a3c6db2484811";
const permutations = getPermutations(keys);

console.log(`Checking ${permutations.length} permutations...`);

for (const p of permutations) {
  const orderedObj = {};
  p.forEach(k => orderedObj[k] = payload[k]);
  
  // Compact
  const compact = JSON.stringify(orderedObj);
  if (web3.utils.keccak256(compact) === targetHash) {
    console.log("MATCH FOUND (Compact):", p.join(", "));
  }

  // Spaced (Python default style)
  const spaced = JSON.stringify(orderedObj, null, 1).replace(/: /g, ': ').replace(/,\n /g, ', ').replace(/\n/g, '').replace(/^{ /, '{').replace(/ }$/, '}');
  // Manual Python-style spaces: {"key": "val", "key2": "val2"}
  const pythonStyle = JSON.stringify(orderedObj).replace(/,/g, ', ').replace(/:/g, ': ');
  if (web3.utils.keccak256(pythonStyle) === targetHash) {
    console.log("MATCH FOUND (Python Spaced):", p.join(", "));
  }
}
