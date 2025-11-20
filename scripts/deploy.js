const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  const Auth = await hre.ethers.getContractFactory("Auth");
  const auth = await Auth.deploy();
  await auth.waitForDeployment();
  const authAddress = await auth.getAddress();
  console.log("Auth deployed to:", authAddress);

  const ElectionManager = await hre.ethers.getContractFactory(
    "ElectionManager"
  );
  const electionManager = await ElectionManager.deploy(authAddress);
  await electionManager.waitForDeployment();
  const electionManagerAddress = await electionManager.getAddress();
  console.log("ElectionManager deployed to:", electionManagerAddress);

  console.log("\nUpdating frontend .env file...");
  const frontendEnvPath = path.join(__dirname, "..", "frontend", "vite-project", ".env");
  
  let envContent = "";
  
  if (fs.existsSync(frontendEnvPath)) {
    envContent = fs.readFileSync(frontendEnvPath, "utf8");
  }

  if (envContent.includes("VITE_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /VITE_CONTRACT_ADDRESS=.*/,
      `VITE_CONTRACT_ADDRESS=${authAddress}`
    );
  } else {
    envContent += `VITE_CONTRACT_ADDRESS=${authAddress}\n`;
  }

  if (envContent.includes("VITE_ELECTION_MANAGER_ADDRESS=")) {
    envContent = envContent.replace(
      /VITE_ELECTION_MANAGER_ADDRESS=.*/,
      `VITE_ELECTION_MANAGER_ADDRESS=${electionManagerAddress}`
    );
  } else {
    envContent += `VITE_ELECTION_MANAGER_ADDRESS=${electionManagerAddress}\n`;
  }

  fs.writeFileSync(frontendEnvPath, envContent.trim() + "\n");
  console.log("✓ Frontend .env updated successfully");
  console.log(`  File: ${frontendEnvPath}`);

  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  const frontendContractsDir = path.join(
    __dirname,
    "..",
    "frontend",
    "vite-project",
    "src",
    "contracts"
  );

  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const authArtifactSrc = path.join(artifactsDir, "Auth.sol", "Auth.json");
  const authArtifactDest = path.join(frontendContractsDir, "Auth.json");
  fs.copyFileSync(authArtifactSrc, authArtifactDest);

  const electionArtifactSrc = path.join(
    artifactsDir,
    "ElectionManager.sol",
    "ElectionManager.json"
  );
  const electionArtifactDest = path.join(
    frontendContractsDir,
    "ElectionManager.json"
  );
  fs.copyFileSync(electionArtifactSrc, electionArtifactDest);

  console.log("✓ Frontend contract ABIs copied to src/contracts");
}

main().catch((error) => {
  console.error("Deployment error:", error);
  process.exitCode = 1;
});
