import { useAuth } from "../../../contexts/AuthProvider.jsx";
import { Navigate } from "react-router-dom";

function Login() {
  const { account, isOnDesiredNetwork, isAdmin, connectWallet, error } =
    useAuth();

  // If you want to redirect if they're already connected and on correct network:
  if (account && isOnDesiredNetwork) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Login Page</h1>

      {account ? (
        <div>
          <p>Connected: {account}</p>
          <p>{isAdmin ? "You are an admin." : "You are a normal user."}</p>
          <p>
            {!isOnDesiredNetwork &&
              "You are on the wrong network. Please switch networks in MetaMask."}
          </p>
        </div>
      ) : (
        <button onClick={connectWallet}>Log In with MetaMask</button>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;
