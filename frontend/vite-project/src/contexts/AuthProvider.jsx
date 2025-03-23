import { createContext, useContext, useState, useEffect } from "react";
import {
  initAuthContract,
  checkIfAdmin,
  addAdmin,
  removeAdmin,
} from "../features/user-auth/services/authService.js";
import { requestAccount } from "../features/user-auth/utilis/walletUtlis";

// Example Hardhat local chain ID (0x7a69 = 31337)
const DESIRED_CHAIN_ID = "0x7a69";

// Grab your Auth contract address from an .env variable
// e.g., VITE_AUTH_CONTRACT_ADDRESS=0x1234...abcd
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [isOnDesiredNetwork, setIsOnDesiredNetwork] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  /**
   * Listen for account changes AFTER the user has connected once
   */
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

  /**
   * Listen for chain changes AFTER the user has connected once
   */
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

  /**
   * Whenever account or network changes, check admin status if we’re on the correct network
   */
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
        // 1) Initialize the Auth contract
        await initAuthContract(CONTRACT_ADDRESS);

        // 2) Check if the user is admin
        const adminStatus = await checkIfAdmin(account);
        setIsAdmin(adminStatus);
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdmin(false);
      }
    }
    fetchAdminStatus();
  }, [account, isOnDesiredNetwork]);

  /**
   * Called when user clicks "Log In" button
   */
  const connectWallet = async () => {
    try {
      setError("");
      const acc = await requestAccount();
      setAccount(acc);

      if (window.ethereum) {
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        console.log("Chain ID from MetaMask (connectWallet):", currentChainId);

        setChainId(currentChainId);
        const onDesiredNetwork =
          currentChainId.toLowerCase() === DESIRED_CHAIN_ID.toLowerCase();
        setIsOnDesiredNetwork(onDesiredNetwork);

        if (!onDesiredNetwork) {
          setError(`Please switch to chain ID ${DESIRED_CHAIN_ID}`);
        }
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    }
  };

  /**
   * Add a new admin address (only works if current user is admin)
   */
  const addAdminAddress = async (newAdmin) => {
    try {
      setError("");
      if (!isAdmin) {
        throw new Error("You must be an admin to add new admins.");
      }
      await initAuthContract(CONTRACT_ADDRESS); // ensure contract is ready
      const tx = await addAdmin(newAdmin);
      console.log("Add Admin TX:", tx);
    } catch (err) {
      console.error("Error adding admin:", err);
      setError(err.message);
    }
  };

  /**
   * Remove an admin address (only works if current user is admin)
   */
  const removeAdminAddress = async (adminToRemove) => {
    try {
      setError("");
      if (!isAdmin) {
        throw new Error("You must be an admin to remove admins.");
      }
      await initAuthContract(CONTRACT_ADDRESS); // ensure contract is ready
      const tx = await removeAdmin(adminToRemove);
      console.log("Remove Admin TX:", tx);
    } catch (err) {
      console.error("Error removing admin:", err);
      setError(err.message);
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
        addAdminAddress,
        removeAdminAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume the Auth context.
 */
export function useAuth() {
  return useContext(AuthContext);
}
