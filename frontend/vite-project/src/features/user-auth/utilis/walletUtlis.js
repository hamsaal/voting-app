import { ethers } from "ethers";

export async function requestAccount() {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected. Please install it.");
  }
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return accounts[0];
}
