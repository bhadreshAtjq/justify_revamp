const { Web3 } = require('web3');
const web3 = new Web3();

const payload = {
  gpa: "6.41",
  name: "Ramesh Agarwal",
  registration_no: "20174304",
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

const jsonString = JSON.stringify(payload);
console.log("Top-Level Sorted Hash:", web3.utils.keccak256(jsonString));
