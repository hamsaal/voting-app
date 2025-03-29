const hre = require("hardhat");

async function main() {
  // Deploy Auth contract first

  const Auth = await hre.ethers.getContractFactory("Auth");
  const auth = await Auth.deploy();
  console.log("Deploying Auth... Tx hash:", auth.deployTransaction.hash);
  await auth.waitForDeployment();
  const authAddress = await auth.getAddress();
  console.log("Auth deployed to:", authAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
