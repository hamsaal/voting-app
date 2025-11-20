import { createContext, useContext, useState, useEffect } from "react";
import {
  initAuthContract,
  checkIfAdmin,
  addAdmin,
  removeAdmin,
} from "../features/user-auth/services/authService.js";
import { requestAccount } from "../features/user-auth/utilis/walletUtlis";


const DESIRED_CHAIN_ID = "0x7a69";


const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;


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


  useEffect(() => {
    async function tryAutoConnect() {
      if (!window.ethereum) {
        console.warn("MetaMask not detected");
        setIsLoading(false);
        return;
      }

      try {
 
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        
        
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
          
  
          localStorage.setItem("connectedAccount", currentAccount);
        } else {
      
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


  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        console.log("🔄 Account changed in MetaMask");
        const newAcc = accounts.length ? accounts[0] : "";
        
 
        setIsAdmin(false);
        setIsLoading(true);
        
        setAccount(newAcc);
        
   
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


  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (newChainId) => {
        console.log("🔄 Network changed to:", newChainId);
       
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

  useEffect(() => {
    async function fetchAdminStatus() {
      console.log("🔍 Verifying admin status", {
        account,
        isOnDesiredNetwork,
        contractAddress: CONTRACT_ADDRESS,
      });

      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "undefined") {
        console.error("❌ Contract address not configured!");
        setError("Configuration error: Contract address missing");
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

 
      if (!account || !isOnDesiredNetwork) {
        console.log("❌ No account or wrong network => isAdmin=false");
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }


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
        setError(""); 
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


  useEffect(() => {

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
     
          setTimeout(() => {
            logout();
          }, 3000);
        } else if (stillAdmin) {
          console.log("✅ Admin status confirmed");
        }
      } catch (err) {
        console.error("❌ Periodic admin check failed:", err);

      }
    }, 30000); 

    return () => {
      console.log("🛑 Clearing periodic admin validation");
      clearInterval(intervalId);
    };
  }, [account, isOnDesiredNetwork, isAdmin]);

  const connectWallet = async () => {
    try {
      setError("");
      const acc = await requestAccount(); 
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
      throw err; 
    }
  };


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
      throw err; 
    }
  };

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


export function useAuth() {
  return useContext(AuthContext);
}
