import { useAuth } from "../../../contexts/AuthProvider.jsx";

function Login() {
  const { account, connectWallet } = useAuth();

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Login Page</h1>
      {account ? (
        <p>You are already connected: {account}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default Login;
