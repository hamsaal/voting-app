const hre = require("hardhat");

async function main() {
  // Deploy Auth contract
  const Auth = await hre.ethers.getContractFactory("Auth");
  const auth = await Auth.deploy();
  await auth.waitForDeployment();
  console.log("Auth deployed to:", auth.address);

  // Deploy ElectionManager contract with the Auth address as constructor parameter
  const ElectionManager = await hre.ethers.getContractFactory(
    "ElectionManager"
  );
  const electionManager = await ElectionManager.deploy(auth.address);
  await electionManager.waitForDeployment();
  console.log("ElectionManager deployed to:", electionManager.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
