import { Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthProvider";

function Login() {
  const {
    account,

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
