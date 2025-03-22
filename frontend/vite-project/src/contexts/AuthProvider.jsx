import { createContext, useContext, useState, useEffect } from "react";
import { requestAccount } from "../features/user-auth/utilis/walletUtlis";

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the provider component
export function AuthProvider({ children }) {
  const [account, setAccount] = useState("");

  // Listen for account changes in MetaMask
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

  // Function to prompt MetaMask connection
  const connectWallet = async () => {
    try {
      const acc = await requestAccount();
      setAccount(acc);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Provide account state and connectWallet to the rest of the app
  const value = {
    account,
    connectWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
