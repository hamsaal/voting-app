const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Deploy Auth contract first
  const Auth = await hre.ethers.getContractFactory("Auth");
  const auth = await Auth.deploy();
  await auth.waitForDeployment();
  const authAddress = await auth.getAddress();
  console.log("Auth deployed to:", authAddress);

  // Deploy ElectionManager contract with Auth's address as parameter
  const ElectionManager = await hre.ethers.getContractFactory(
    "ElectionManager"
  );
  const electionManager = await ElectionManager.deploy(authAddress);
  await electionManager.waitForDeployment();
  const electionManagerAddress = await electionManager.getAddress();
  console.log("ElectionManager deployed to:", electionManagerAddress);
}

main().catch((error) => {
  console.error("Deployment error:", error);
  process.exitCode = 1;
});
