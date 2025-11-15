const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

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

  // Update frontend .env file with contract addresses
  console.log("\nUpdating frontend .env file...");
  const frontendEnvPath = path.join(__dirname, "..", "frontend", "vite-project", ".env");
  
  let envContent = "";
  
  // Read existing .env file if it exists
  if (fs.existsSync(frontendEnvPath)) {
    envContent = fs.readFileSync(frontendEnvPath, "utf8");
  }

  // Update or add VITE_CONTRACT_ADDRESS
  if (envContent.includes("VITE_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /VITE_CONTRACT_ADDRESS=.*/,
      `VITE_CONTRACT_ADDRESS=${authAddress}`
    );
  } else {
    envContent += `VITE_CONTRACT_ADDRESS=${authAddress}\n`;
  }

  // Update or add VITE_ELECTION_MANAGER_ADDRESS
  if (envContent.includes("VITE_ELECTION_MANAGER_ADDRESS=")) {
    envContent = envContent.replace(
      /VITE_ELECTION_MANAGER_ADDRESS=.*/,
      `VITE_ELECTION_MANAGER_ADDRESS=${electionManagerAddress}`
    );
  } else {
    envContent += `VITE_ELECTION_MANAGER_ADDRESS=${electionManagerAddress}\n`;
  }

  // Write to file
  fs.writeFileSync(frontendEnvPath, envContent.trim() + "\n");
  console.log("✓ Frontend .env updated successfully");
  console.log(`  File: ${frontendEnvPath}`);
}

main().catch((error) => {
  console.error("Deployment error:", error);
  process.exitCode = 1;
});
