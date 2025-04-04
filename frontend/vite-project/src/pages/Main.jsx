import { useAuth } from "../contexts/AuthProvider.jsx";
import { Navigate } from "react-router-dom";
import Home from "./Home.jsx";

function Main() {
  const { account, isAdmin, isLoading, error, logout } = useAuth();

  // 1. If still checking admin status, show a spinner or message
  if (isLoading) {
    return <div>Checking admin status...</div>;
  }

  // 2. If no account, redirect to login
  if (!account) {
    return <Navigate to="/login" replace />;
  }

  // 3. If wrong network, show a message

  // 4. If the user is admin, redirect to the admin management page
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // 5. If everything is good and the user is a normal user, show the Home page.
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={logout}>Logout</button>

      <Home />
    </div>
  );
}

export default Main;
