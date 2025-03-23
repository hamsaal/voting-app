// src/pages/Home.jsx

import { useAuth } from "../contexts/AuthProvider.jsx";

function Home() {
  const { account, chainId, isAdmin } = useAuth();

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Home Page</h1>
      <p>Wallet: {account}</p>
      <p>Chain ID: {chainId}</p>
      <p>{isAdmin ? "You have admin privileges." : "You are a normal user."}</p>
    </div>
  );
}

export default Home;
