// src/pages/AdminPanel.jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthProvider.jsx";

function AdminPanel() {
  const { account, addAdminAddress, removeAdminAddress, error } = useAuth();
  const [newAdmin, setNewAdmin] = useState("");
  const [adminToRemove, setAdminToRemove] = useState("");
  const [status, setStatus] = useState("");

  const handleAdd = async () => {
    try {
      setStatus("");
      await addAdminAddress(newAdmin);
      setStatus(`Added new admin: ${newAdmin}`);
    } catch (err) {
      setStatus(`Failed to add admin: ${err.message}`);
    }
  };

  const handleRemove = async () => {
    try {
      setStatus("");
      await removeAdminAddress(adminToRemove);
      setStatus(`Removed admin: ${adminToRemove}`);
    } catch (err) {
      setStatus(`Failed to remove admin: ${err.message}`);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Admin Panel</h1>
      <p>Logged in as: {account}</p>

      <div style={{ marginTop: "1rem" }}>
        <input
          placeholder="New admin address"
          value={newAdmin}
          onChange={(e) => setNewAdmin(e.target.value)}
        />
        <button onClick={handleAdd}>Add Admin</button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <input
          placeholder="Admin address to remove"
          value={adminToRemove}
          onChange={(e) => setAdminToRemove(e.target.value)}
        />
        <button onClick={handleRemove}>Remove Admin</button>
      </div>

      {status && <p style={{ color: "green" }}>{status}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default AdminPanel;
