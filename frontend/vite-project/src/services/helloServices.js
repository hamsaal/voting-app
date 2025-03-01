// src/services/helloServices.js
import { ethers } from "ethers";
import HelloWorldArtifact from "../../../../artifacts/contracts/HelloWorld.sol/HelloWorld.json";

let helloWorldContract;

export const initHelloWorldContract = async (contractAddress) => {
  if (window.ethereum) {
    // Use MetaMask's provider with ethers v6
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    // Create a contract instance with the ABI, address, and signer
    helloWorldContract = new ethers.Contract(
      contractAddress,
      HelloWorldArtifact.abi,
      signer
    );
  } else {
    throw new Error("MetaMask is not installed.");
  }
};

export const getGreet = async () => {
  if (!helloWorldContract) {
    throw new Error("Contract is not initialized");
  }
  // Call the contract’s greet() function
  return await helloWorldContract.greet();
};
