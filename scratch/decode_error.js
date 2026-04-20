const { ethers } = require("ethers");
const fs = require("fs");

const ABI = JSON.parse(fs.readFileSync("./lib/abi/AnchorStore.json", "utf8"));
const iface = new ethers.Interface(ABI);
const data = "0x756688fe";

console.log("Searching for selector:", data);

try {
    const error = iface.parseError(data);
    console.log("Decoded error:", error.name);
} catch (e) {
    ABI.forEach(item => {
        if (item.type === "error") {
            const signature = `${item.name}(${item.inputs.map(i => i.type).join(",")})`;
            const selector = ethers.id(signature).slice(0, 10);
            if (selector === data) {
                console.log("MATCH FOUND!", item.name);
            }
        }
    });
}
