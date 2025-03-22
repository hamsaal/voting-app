import { useAuth } from "../contexts/AuthProvider.jsx";

function Home() {
  const { account } = useAuth();

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Home Page</h1>
      <p>Connected wallet: {account}</p>
      <p>This is where your main DApp functionality goes.</p>
    </div>
  );
}

export default Home;
