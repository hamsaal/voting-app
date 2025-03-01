import { useState, useEffect } from "react";
import { initHelloWorldContract, getGreet } from "./services/helloServices";

function App() {
  const deployedContractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const [greeting, setGreeting] = useState("");
  const [account, setAccount] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => setAccount(accounts[0]))
        .catch((err) => console.error("Error connecting to MetaMask:", err));

      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
        }
      };
    } else {
      console.log(
        "MetaMask is not installed. Please install it to use this DApp."
      );
    }
  }, []);

  const fetchGreeting = async () => {
    try {
      console.log("Using contract address:", deployedContractAddress);
      await initHelloWorldContract(deployedContractAddress);
      const greet = await getGreet();
      setGreeting(greet);
    } catch (err) {
      console.error("Error fetching greeting:", err);
    }
  };

  return (
    <div>
      <h1>HelloWorld DApp</h1>
      {account ? (
        <p>Welcome, {account}!</p>
      ) : (
        <p>Please connect your MetaMask wallet.</p>
      )}
      <button onClick={fetchGreeting}>Fetch Greeting</button>
      {greeting && <p>Contract says: {greeting}</p>}
    </div>
  );
}

export default App;
