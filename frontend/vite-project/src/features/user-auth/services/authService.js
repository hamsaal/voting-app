import { ethers } from "ethers";
import authArtifact from "/root/repo/voting-app/artifacts/contracts/Auth.sol/Auth.json"

// We'll store a reference to the contract here once it's initialized
let authContract;

/**
 * Initialize the Auth contract using the deployed address and a signer (MetaMask).
 * @param {string} contractAddress The deployed Auth contract address.
 */
export async function initAuthContract(contractAddress) {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  // Create a provider & signer (Ethers v6 syntax)
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Initialize the contract
  authContract = new ethers.Contract(contractAddress, authArtifact.abi, signer);

  return authContract; // in case you want to do something immediately
}

/**
 * Check if a given account is admin.
 * @param {string} account The address to check (e.g., "0x1234...")
 * @returns {Promise<boolean>}
 */
export async function checkIfAdmin(account) {
  if (!authContract) {
    throw new Error(
      "Auth contract not initialized. Call initAuthContract() first."
    );
  }
  return await authContract.isAdmin(account);
}

/**
 * Add a new admin. Only callable by current admins.
 * @param {string} newAdminAddress The address to grant admin rights.
 */
export async function addAdmin(newAdminAddress) {
  if (!authContract) {
    throw new Error(
      "Auth contract not initialized. Call initAuthContract() first."
    );
  }
  const tx = await authContract.addAdmin(newAdminAddress);
  await tx.wait(); // Wait for the transaction to confirm
}

/**
 * Remove an admin. Only callable by current admins.
 * @param {string} adminToRemove The address to revoke admin rights.
 */
export async function removeAdmin(adminToRemove) {
  if (!authContract) {
    throw new Error(
      "Auth contract not initialized. Call initAuthContract() first."
    );
  }
  const tx = await authContract.removeAdmin(adminToRemove);
  await tx.wait();
}
