// src/features/user-auth/pages/Login.jsx

import { useAuth } from "../../../contexts/AuthProvider.jsx";
import { Navigate } from "react-router-dom";

function Login() {
  const { account, isAdmin, isOnDesiredNetwork, error, connectWallet } =
    useAuth();

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
