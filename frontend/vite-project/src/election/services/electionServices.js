import { ethers } from "ethers";
import electionManagerArtifact from "/Users/Taz/voting-app/artifacts/contracts/ElectionManager.sol/ElectionManager.json";

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
 * Create a new election.
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
 * Also checks if the current account has voted in each election.
 * @param {string} currentAccount The user's wallet address.
 * @returns {Promise<Array>} Array of election objects.
 */
export async function fetchElections(currentAccount) {
  if (!electionManagerContract) {
    throw new Error("ElectionManager contract not initialized");
  }
  const countBN = await electionManagerContract.electionCount();
  const count = Number(countBN);
  const elections = [];
  for (let i = 1; i <= count; i++) {
    const election = await electionManagerContract.elections(i);
    let voted = false;
    if (currentAccount) {
      voted = await electionManagerContract.hasVoted(i, currentAccount);
    }
    elections.push({
      id: Number(election.id),
      title: election.title,
      description: election.description,
      candidates: election.candidates,
      startTime: Number(election.startTime),
      endTime: Number(election.endTime),
      active: election.active,
      hasVoted: voted,
    });
  }
  return elections;
}

/**
 * Vote for a candidate in an election.
 * @param {number} electionId The election ID.
 * @param {number} candidateIndex The candidate's index.
 */
export async function vote(electionId, candidateIndex) {
  if (!electionManagerContract) {
    throw new Error("ElectionManager contract not initialized");
  }
  const tx = await electionManagerContract.vote(electionId, candidateIndex);
  await tx.wait();
  return tx;
}

/**
 * Compute the winner of an expired election.
 * @param {number} electionId The election ID.
 * @returns {string} The winning candidate's name.
 */
export async function computeWinner(electionId) {
  if (!electionManagerContract) {
    throw new Error("ElectionManager contract not initialized");
  }
  const winner = await electionManagerContract.computeWinner(electionId);
  return winner;
}
