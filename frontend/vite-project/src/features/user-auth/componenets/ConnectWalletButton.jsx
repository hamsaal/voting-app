

function ConnectWalletButton({ onConnect }) {
  const handleConnect = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install it.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      onConnect(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return <button onClick={handleConnect}>Connect Wallet</button>;
}

export default ConnectWalletButton;
