// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const Auth = await hre.ethers.getContractFactory("Auth");
  const auth = await Auth.deploy();
  const authAddress = await auth.getAddress(); // Ethers v6
  console.log("Auth deployed to:", authAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
