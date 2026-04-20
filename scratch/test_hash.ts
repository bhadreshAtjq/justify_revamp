import { keccak256 } from "js-sha3";

const reg = "2072116024";
const gpa = "6.93";
const target = "7e93a7b62af66b70e26d9d8735adbcf7b821d632c597812f9200a88575ca2237";

// Try different combinations
const combo1 = keccak256(reg + gpa);
const combo2 = keccak256(reg);
const combo3 = keccak256(gpa);

console.log("Combo1 (Reg+GPA):", combo1);
console.log("Target matches?", combo1 === target);
