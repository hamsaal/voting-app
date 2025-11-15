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

// Validate contract address on load
if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "undefined") {
  console.error("❌ VITE_CONTRACT_ADDRESS is not configured in .env file!");
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [isOnDesiredNetwork, setIsOnDesiredNetwork] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Auto-connect on mount and verify chain ID:
   * 1) Check MetaMask for current account (don't trust localStorage alone)
   * 2) Verify network and set initial state
   */
  useEffect(() => {
    async function tryAutoConnect() {
      if (!window.ethereum) {
        console.warn("MetaMask not detected");
        setIsLoading(false);
        return;
      }

      try {
        // Get current accounts from MetaMask (most reliable source)
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        
        // Get current chain ID
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        
        setChainId(currentChainId);
        setIsOnDesiredNetwork(
          currentChainId.toLowerCase() === DESIRED_CHAIN_ID.toLowerCase()
        );

        if (accounts.length) {
          const currentAccount = accounts[0];
          console.log("Auto-connecting to:", currentAccount);
          setAccount(currentAccount);
          
          // Sync localStorage with MetaMask state
          localStorage.setItem("connectedAccount", currentAccount);
        } else {
          // No connected accounts, clear localStorage
          localStorage.removeItem("connectedAccount");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error during auto-connect:", error);
        localStorage.removeItem("connectedAccount");
        setIsLoading(false);
      }
    }
    tryAutoConnect();
  }, []);

  /**
   * Listen for account changes in MetaMask
   * SECURITY: When account changes, immediately reset admin status and re-verify
   */
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        console.log("🔄 Account changed in MetaMask");
        const newAcc = accounts.length ? accounts[0] : "";
        
        // SECURITY: Immediately reset admin status on account change
        setIsAdmin(false);
        setIsLoading(true);
        
        setAccount(newAcc);
        
        // Update local storage
        if (newAcc) {
          localStorage.setItem("connectedAccount", newAcc);
        } else {
          localStorage.removeItem("connectedAccount");
          setIsLoading(false);
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
   * SECURITY: When network changes, reset admin status and force re-verification
   */
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (newChainId) => {
        console.log("🔄 Network changed to:", newChainId);
        
        // SECURITY: Reset admin status when network changes
        setIsAdmin(false);
        setIsLoading(true);
        
        setChainId(newChainId);
        const onDesired = newChainId.toLowerCase() === DESIRED_CHAIN_ID.toLowerCase();
        setIsOnDesiredNetwork(onDesired);
        
        if (!onDesired) {
          setError(`Wrong network! Please switch to chain ID ${DESIRED_CHAIN_ID}`);
          setIsLoading(false);
        }
      };
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  /**
   * Whenever account or network changes, check admin status if on correct network
   * SECURITY: Always verify admin status from blockchain, never trust local state
   */
  useEffect(() => {
    async function fetchAdminStatus() {
      console.log("🔍 Verifying admin status", {
        account,
        isOnDesiredNetwork,
        contractAddress: CONTRACT_ADDRESS,
      });

      // SECURITY CHECK 1: Contract address must be configured
      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "undefined") {
        console.error("❌ Contract address not configured!");
        setError("Configuration error: Contract address missing");
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // SECURITY CHECK 2: Must have account and be on correct network
      if (!account || !isOnDesiredNetwork) {
        console.log("❌ No account or wrong network => isAdmin=false");
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // SECURITY CHECK 3: Validate account format
      if (!/^0x[a-fA-F0-9]{40}$/.test(account)) {
        console.error("❌ Invalid account format:", account);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        console.log("🔐 Initializing Auth contract at:", CONTRACT_ADDRESS);
        await initAuthContract(CONTRACT_ADDRESS);
        
        console.log("🔍 Checking admin status for:", account);
        const adminStatus = await checkIfAdmin(account);
        
        console.log(adminStatus ? "✅ Admin verified" : "❌ Not an admin");
        setIsAdmin(adminStatus);
        setError(""); // Clear any previous errors
      } catch (err) {
        console.error("❌ Admin verification failed:", err);
        setIsAdmin(false);
        setError("Failed to verify admin status. Please refresh and try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAdminStatus();
  }, [account, isOnDesiredNetwork]);

  /**
   * Periodic re-validation of admin status
   * SECURITY: Re-check admin status every 30 seconds to catch permission changes
   */
  useEffect(() => {
    // Only set up interval if user is authenticated and on correct network
    if (!account || !isOnDesiredNetwork || !isAdmin) {
      return;
    }

    console.log("🔄 Setting up periodic admin re-validation (every 30s)");

    const intervalId = setInterval(async () => {
      try {
        console.log("🔍 Periodic admin status check...");
        await initAuthContract(CONTRACT_ADDRESS);
        const stillAdmin = await checkIfAdmin(account);
        
        if (!stillAdmin && isAdmin) {
          console.warn("⚠️ Admin privileges revoked! Logging out...");
          setIsAdmin(false);
          setError("Your admin privileges have been revoked. Please log in again.");
          // Force logout after a delay so user can see the message
          setTimeout(() => {
            logout();
          }, 3000);
        } else if (stillAdmin) {
          console.log("✅ Admin status confirmed");
        }
      } catch (err) {
        console.error("❌ Periodic admin check failed:", err);
        // Don't logout on temporary failures, just log the error
      }
    }, 30000); // Check every 30 seconds

    // Cleanup interval on unmount or when dependencies change
    return () => {
      console.log("🛑 Clearing periodic admin validation");
      clearInterval(intervalId);
    };
  }, [account, isOnDesiredNetwork, isAdmin]);

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
      return tx;
    } catch (err) {
      console.error("Error adding admin:", err);
      setError(err.message);
      throw err; // Re-throw so the calling component can handle it
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
      return tx;
    } catch (err) {
      console.error("Error removing admin:", err);
      setError(err.message);
      throw err; // Re-throw so the calling component can handle it
    }
  };
  /**
   * Logout function - clears all auth state
   * SECURITY: Completely resets authentication state
   */
  const logout = () => {
    console.log("🚪 Logging out");
    setAccount("");
    setIsAdmin(false);
    setIsOnDesiredNetwork(false);
    setChainId("");
    setError("");
    setIsLoading(false);
    localStorage.removeItem("connectedAccount");
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
