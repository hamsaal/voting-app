import { createContext, useContext, useState, useEffect } from "react";

// import {
//   initVotingContract,
//   checkIfAdmin,
// } from "../features/voting/services/votingServices";
import { requestAccount } from "../features/user-auth/utilis/walletUtlis";

// Set the chain ID you expect (e.g., "0x539" for Hardhat localhost,
// "0x5" for Goerli, "0x13881" for Polygon Mumbai, etc.)
const DESIRED_CHAIN_ID = "0x7a69"; // Example: Hardhat local

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [isOnDesiredNetwork, setIsOnDesiredNetwork] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  // Listen for account changes AFTER the user has connected once
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        setAccount(accounts.length ? accounts[0] : "");
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, []);

  // Listen for chain changes AFTER the user has connected once
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (newChainId) => {
        setChainId(newChainId);
        setIsOnDesiredNetwork(
          newChainId.toLowerCase() === DESIRED_CHAIN_ID.toLowerCase()
        );
      };
      window.ethereum.on("chainChanged", handleChainChanged);
      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Whenever account or network changes, check admin status if we’re on the correct network
  useEffect(() => {
    async function fetchAdminStatus() {
      if (!account) {
        setIsAdmin(false);
        return;
      }
      if (!isOnDesiredNetwork) {
        setIsAdmin(false);
        return;
      }
      try {
        // Initialize the contract & check if admin
        await initVotingContract(import.meta.env.VITE_CONTRACT_ADDRESS);
        const adminStatus = await checkIfAdmin(account);
        setIsAdmin(adminStatus);
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdmin(false);
      }
    }
    fetchAdminStatus();
  }, [account, isOnDesiredNetwork]);

  // Called when user clicks "Log In"
  const connectWallet = async () => {
    try {
      setError("");
      // 1) Prompt MetaMask for accounts
      const acc = await requestAccount();
      setAccount(acc);

      // 2) Check chain ID
      if (window.ethereum) {
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        console.log("Chain ID from MetaMask (connectWallet):", currentChainId);

        setChainId(currentChainId);
        const onDesiredNetwork =
          currentChainId.toLowerCase() === DESIRED_CHAIN_ID.toLowerCase();
        setIsOnDesiredNetwork(onDesiredNetwork);

        // If on the wrong chain, set an error message
        if (!onDesiredNetwork) {
          setError(`Please switch to chain ID ${DESIRED_CHAIN_ID}`);
        }
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        account,
        chainId,
        isOnDesiredNetwork,
        isAdmin,
        error,
        connectWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
