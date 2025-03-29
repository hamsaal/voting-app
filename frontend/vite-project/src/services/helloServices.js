const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // 1. Deploy Auth contract
  const Auth = await hre.ethers.getContractFactory("Auth");
  const auth = await Auth.deploy();
  console.log("Auth deployment transaction hash:", auth.deployTransaction.hash);
  // Wait until the Auth contract is fully deployed
  await auth.waitForDeployment();
  const authAddress = await auth.getAddress();
  console.log("Auth deployed to:", authAddress);

  // 2. Deploy ElectionManager contract with Auth's address as constructor parameter
  const ElectionManager = await hre.ethers.getContractFactory(
    "ElectionManager"
  );
  const electionManager = await ElectionManager.deploy(authAddress);
  console.log(
    "ElectionManager deployment transaction hash:",
    electionManager.deployTransaction.hash
  );
  // Wait until ElectionManager is fully deployed
  await electionManager.waitForDeployment();
  const electionManagerAddress = await electionManager.getAddress();
  console.log("ElectionManager deployed to:", electionManagerAddress);
}

main().catch((error) => {
  console.error("Deployment error:", error);
  process.exitCode = 1;
});
