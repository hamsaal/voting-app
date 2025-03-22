const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  console.log("Contract factory loaded");

  const helloWorld = await HelloWorld.deploy();

  if (helloWorld.deployTransaction && helloWorld.deployTransaction.hash) {
    console.log(
      "Deployment transaction sent:",
      helloWorld.deployTransaction.hash
    );
  } else if (
    helloWorld.deploymentTransaction &&
    helloWorld.deploymentTransaction.hash
  ) {
    console.log(
      "Deployment transaction sent:",
      helloWorld.deploymentTransaction.hash
    );
  } else {
    console.log("Deployment transaction hash not available.");
  }

  if (helloWorld.waitForDeployment) {
    await helloWorld.waitForDeployment();
    console.log("Deployment confirmed");
    console.log("HelloWorld deployed to:", await helloWorld.getAddress());
  } else {
    await helloWorld.deployed();
    console.log("Deployment confirmed");
    console.log("HelloWorld deployed to:", helloWorld.address);
  }
}

main().catch((error) => {
  console.error("Deployment error:", error);
  process.exitCode = 1;
});
