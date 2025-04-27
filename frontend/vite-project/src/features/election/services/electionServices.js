import { ethers } from "ethers";
import electionManagerArtifact from "/Users/hamza/Desktop/voting-app/artifacts/contracts/ElectionManager.sol/ElectionManager.json";

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
    const [
      id,
      title,
      description,
      candidates,
      startTime,
      endTime,
      active
    ] = await electionManagerContract.getElection(i);
  
    const hasVoted = currentAccount
      ? await electionManagerContract.hasVoted(i, currentAccount)
      : false;

   const voteCounts = await Promise.all(
     candidates.map((_, idx) =>
     electionManagerContract.votes(id, idx).then(bn => Number(bn))
   )
   );
   // ───────────────────────────────────────────────────────
  
    elections.push({
      id:         Number(id),
      title,
      description,
      candidates,
      startTime:  Number(startTime),
      endTime:    Number(endTime),
      active,
      hasVoted,
      voteCounts
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
/**
 * Get the vote count for a single candidate in an election
 */
export async function getVoteCount(electionId, candidateIndex) {
  if (!electionManagerContract) {
    throw new Error("ElectionManager contract not initialized");
  }
  const bn = await electionManagerContract.votes(electionId, candidateIndex);
  return Number(bn);
}
export async function getElectionResults(electionId) {
  if (!electionManagerContract) {
    throw new Error("ElectionManager contract not initialized");
  }
  // This returns [candidates, counts, isDraw, winner]
  const [candidates, counts, isDraw, winner] =
    await electionManagerContract.getElectionResults(electionId);
  return { candidates, counts, isDraw, winner };
}
// New functions for publishing and reading published results

/**
 * Check if results for a given election are published on-chain.
 * @param {number} electionId
 * @returns {Promise<boolean>}
 */
export async function isResultsPublished(electionId) {
  if (!electionManagerContract) {
    throw new Error("ElectionManager contract not initialized");
  }
  return await electionManagerContract.resultsPublished(electionId);
}

/**
 * Publish the results of an election on-chain (admin only).
 * @param {number} electionId
 * @returns {Promise<ethers.providers.TransactionResponse>}
 */
export async function publishResults(electionId) {
  if (!electionManagerContract) {
    throw new Error("ElectionManager contract not initialized");
  }
  const tx = await electionManagerContract.publishResults(electionId);
  await tx.wait();
  return tx;
}

/**
 * Fetch the published results for an election.
 * @param {number} electionId
 * @returns {Promise<{candidates: string[]; counts: number[]; isDraw: boolean; winner: string;}>>}
 */
export async function getPublishedResults(electionId) {
  if (!electionManagerContract) {
    throw new Error("ElectionManager contract not initialized");
  }
  // Ethers.js may return both array & named properties
  const res = await electionManagerContract.publishedResults(electionId);
  const candidates = res.candidates ?? res[0];
  const rawCounts = res.counts ?? res[1];
  const counts = Array.isArray(rawCounts)
    ? rawCounts.map(c => (c.toNumber ? c.toNumber() : c))
    : [];
  const isDraw = res.isDraw ?? res[2];
  const winner = res.winner ?? res[3];
  return { candidates, counts, isDraw, winner };
}

