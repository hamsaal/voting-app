import { createContext, useContext, useState, useEffect } from "react";
import {
  initAuthContract,
  checkIfAdmin,
  addAdmin,
  removeAdmin,
} from "../features/user-auth/services/authService.js";
import { requestAccount } from "../features/user-auth/utilis/walletUtlis";

// Hardhat local chain ID (0x7a69 = 31337 decimal)
const DESIRED_CHAIN_ID = "0x7a69";

// The Auth contract address from your .env, e.g., VITE_CONTRACT_ADDRESS=0x1234...
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [isOnDesiredNetwork, setIsOnDesiredNetwork] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Auto-connect on mount:
   * 1) Check if there's a stored account in localStorage (optional).
   * 2) If none, call MetaMask's 'eth_accounts' to see if there's an already-approved account.
   */
  useEffect(() => {
    async function tryAutoConnect() {
      // 1. Check local storage
      const storedAcc = localStorage.getItem("connectedAccount");
      if (storedAcc) {
        console.log("Restoring account from localStorage:", storedAcc);
        setAccount(storedAcc);
      } else if (window.ethereum) {
        // 2. Check if MetaMask has an approved account
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length) {
          console.log("Auto-connecting to:", accounts[0]);
          setAccount(accounts[0]);
          localStorage.setItem("connectedAccount", accounts[0]); // optional
        }
      }
      // We won't set chainId yet—will do so after connect or in the next effect.
    }
    tryAutoConnect();
  }, []);

  /**
   * Listen for account changes in MetaMask
   */
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        const newAcc = accounts.length ? accounts[0] : "";
        setAccount(newAcc);
        // Update local storage
        if (newAcc) {
          localStorage.setItem("connectedAccount", newAcc);
        } else {
          localStorage.removeItem("connectedAccount");
        }
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
   * Listen for chain changes in MetaMask
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
   * Whenever account or network changes, check admin status if on correct network
   */
  useEffect(() => {
    async function fetchAdminStatus() {
      console.log("fetchAdminStatus triggered", {
        account,
        isOnDesiredNetwork,
      });

      // If no account or wrong network, skip contract calls
      if (!account || !isOnDesiredNetwork) {
        console.log(
          "No account or wrong network => isAdmin=false, isLoading=false"
        );
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      console.log("Setting isLoading=true");
      setIsLoading(true);

      try {
        console.log("Initializing contract at:", CONTRACT_ADDRESS);
        await initAuthContract(CONTRACT_ADDRESS);
        console.log("Contract initialized. Checking admin for:", account);
        const adminStatus = await checkIfAdmin(account);
        console.log("adminStatus is:", adminStatus);
        setIsAdmin(adminStatus);
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdmin(false);
      } finally {
        console.log("Finally block => isLoading=false");
        setIsLoading(false);
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
      const acc = await requestAccount(); // triggers MetaMask to request accounts
      setAccount(acc);
      localStorage.setItem("connectedAccount", acc);

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
   * Add new admin address (only works if current user is admin)
   */
  const addAdminAddress = async (newAdmin) => {
    try {
      setError("");
      if (!isAdmin) {
        throw new Error("You must be an admin to add new admins.");
      }
      await initAuthContract(CONTRACT_ADDRESS);
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
      await initAuthContract(CONTRACT_ADDRESS);
      const tx = await removeAdmin(adminToRemove);
      console.log("Remove Admin TX:", tx);
    } catch (err) {
      console.error("Error removing admin:", err);
      setError(err.message);
    }
  };
  const logout = () => {
    setAccount("");
    setIsAdmin(false);
    localStorage.removeItem("connectedAccount"); // if you're storing the account
  };

  return (
    <AuthContext.Provider
      value={{
        account,
        chainId,
        isOnDesiredNetwork,
        isAdmin,
        isLoading,
        error,
        connectWallet,
        addAdminAddress,
        removeAdminAddress,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume AuthContext
 */
export function useAuth() {
  return useContext(AuthContext);
}
