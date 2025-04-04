import { ethers } from "ethers";
import electionManagerArtifact from "/Users/Taz/voting-app/artifacts/contracts/ElectionManager.sol/ElectionManager.json";

// Reference to the ElectionManager contract instance
let electionManagerContract;

/**
 * Initialize the ElectionManager contract using the deployed address and a signer (MetaMask).
 * @param {string} contractAddress The deployed ElectionManager contract address.
 */
export async function initElectionManagerContract(contractAddress) {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  electionManagerContract = new ethers.Contract(
    contractAddress,
    electionManagerArtifact.abi,
    signer
  );
  return electionManagerContract;
}

/**
 * Create a new election by calling the ElectionManager contract.
 * @param {string} title The title of the election.
 * @param {string} description A brief description of the election.
 * @param {string[]} candidates An array of candidate addresses.
 * @param {number} startTime The start time as a Unix timestamp.
 * @param {number} endTime The end time as a Unix timestamp.
 */
export async function createElection(
  title,
  description,
  candidates,
  startTime,
  endTime
) {
  if (!electionManagerContract) {
    throw new Error("ElectionManager contract not initialized");
  }
  const tx = await electionManagerContract.createElection(
    title,
    description,
    candidates,
    startTime,
    endTime
  );
  await tx.wait();
  return tx;
}

/**
 * Fetch all elections from the ElectionManager contract.
 * Converts BigNumber values to numbers for display.
 * @returns {Promise<Array>} An array of election objects.
 */
export async function fetchElections() {
  if (!electionManagerContract) {
    throw new Error("ElectionManager contract not initialized");
  }
  const countBN = await electionManagerContract.electionCount();
  const count = Number(countBN);
  const elections = [];
  for (let i = 1; i <= count; i++) {
    const election = await electionManagerContract.elections(i);
    elections.push({
      id: Number(election.id),
      title: election.title,
      description: election.description,
      candidates: election.candidates,
      startTime: Number(election.startTime),
      endTime: Number(election.endTime),
      active: election.active,
    });
  }
  return elections;
}
