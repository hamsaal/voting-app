// src/pages/MainPage.jsx

import { useAuth } from "../contexts/AuthProvider.jsx";
import { Navigate } from "react-router-dom";
import Home from "./Home.jsx";
import AdminPanel from "./AdminPanel.jsx";

function Main() {
  const {
    account,
    chainId,
    isAdmin,
    isOnDesiredNetwork,
    isLoading,
    error,
    logout,
  } = useAuth();

  // 1. If still checking admin status, show a spinner or message
  if (isLoading) {
    return <div>Checking admin status...</div>;
  }

  // 2. If no account, redirect to login
  if (!account) {
    return <Navigate to="/login" replace />;
  }

  // 3. If wrong network, show a message
  if (!isOnDesiredNetwork) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>Please switch to the correct network</h1>
        <p>Expected chain ID: 0x7a69 (Hardhat local by default)</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  // 4. If everything is good, show a top bar + either AdminPanel or Home
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <p>Logged in as: {account}</p>
      <p>Chain ID: {chainId}</p>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={logout}>Logout</button>

      {isAdmin ? (
        <>
          <h2>Admin Panel</h2>
          <AdminPanel />
        </>
      ) : (
        <>
          <h2>Home Page</h2>
          <Home />
        </>
      )}
    </div>
  );
}

export default Main;
