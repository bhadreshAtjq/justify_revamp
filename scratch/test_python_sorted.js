const { Web3 } = require('web3');
const web3 = new Web3();

function sortObject(obj) {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj === null || typeof obj !== 'object') return obj;
  const sorted = {};
  Object.keys(obj).sort().forEach(k => {
    sorted[k] = sortObject(obj[k]);
  });
  return sorted;
}

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

const sortedPayload = sortObject(payload);
const pythonDefaultString = JSON.stringify(sortedPayload, null, 1)
  .replace(/: /g, ': ')
  .replace(/,\n /g, ', ')
  .replace(/\n/g, '')
  .replace(/^{ /, '{')
  .replace(/ }$/, '}');

// More reliable way to get Python's default separators (", ", ": ")
const pythonStyleManual = JSON.stringify(sortedPayload).replace(/,/g, ', ').replace(/:/g, ': ');

console.log("Python Style Manual Hash:", web3.utils.keccak256(pythonStyleManual));
