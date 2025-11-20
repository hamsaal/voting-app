import { ethers } from "ethers";
import authArtifact from "../../../contracts/Auth.json";

let authContract;

/**
 * Initialize the Auth contract using the deployed address and a signer (MetaMask).
 * @param {string} contractAddress The deployed Auth contract address.
 */
export async function initAuthContract(contractAddress) {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }


  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();


  authContract = new ethers.Contract(contractAddress, authArtifact.abi, signer);

  return authContract; 
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
  await tx.wait(); 
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
