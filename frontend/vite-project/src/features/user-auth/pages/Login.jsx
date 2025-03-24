import React from "react";
import { useAuth } from "../../../contexts/AuthProvider.jsx";
import { Navigate } from "react-router-dom";

function Login() {
  const {
    account,
    isAdmin,
    isOnDesiredNetwork,
    isLoading,
    error,
    connectWallet,
  } = useAuth();

  // If we haven't finished checking admin status, don't redirect yet
  if (isLoading) {
    return <div>Checking admin status...</div>;
  }

  // If user is connected & on correct network
  if (account && isOnDesiredNetwork) {
    // If admin, go to /admin
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    // Otherwise, go to /
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Login Page</h1>
      <button onClick={connectWallet}>Log In with MetaMask</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;
