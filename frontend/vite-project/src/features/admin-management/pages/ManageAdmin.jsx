import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../../contexts/AuthProvider.jsx";
import { initAuthContract, checkIfAdmin } from "../../user-auth/services/authService.js";

function ManageAdmin() {
  const { addAdminAddress, removeAdminAddress } = useAuth();

  // State for adding admin
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");

  // State for removing admin
  const [removeAddress, setRemoveAddress] = useState("");
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeSuccess, setRemoveSuccess] = useState("");
  const [removeError, setRemoveError] = useState("");

  // State for checking admin status
  const [checkAddress, setCheckAddress] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState("");

  /**
   * Validate Ethereum address format
   */
  const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  /**
   * Handle adding a new admin
   */
  const handleAddAdmin = async () => {
    setAddSuccess("");
    setAddError("");

    if (!newAdminAddress.trim()) {
      setAddError("Please enter a wallet address");
      return;
    }

    if (!isValidAddress(newAdminAddress.trim())) {
      setAddError("Invalid Ethereum address format. Must start with 0x and be 42 characters long");
      return;
    }

    setAddLoading(true);

    try {
      await addAdminAddress(newAdminAddress.trim());
      setAddSuccess(`Successfully added ${newAdminAddress} as admin!`);
      setNewAdminAddress(""); // Clear input
    } catch (error) {
      console.error("Error adding admin:", error);
      setAddError(error.message || "Failed to add admin");
    } finally {
      setAddLoading(false);
    }
  };

  /**
   * Handle removing an admin
   */
  const handleRemoveAdmin = async () => {
    setRemoveSuccess("");
    setRemoveError("");

    if (!removeAddress.trim()) {
      setRemoveError("Please enter a wallet address");
      return;
    }

    if (!isValidAddress(removeAddress.trim())) {
      setRemoveError("Invalid Ethereum address format");
      return;
    }

    setRemoveLoading(true);

    try {
      await removeAdminAddress(removeAddress.trim());
      setRemoveSuccess(`Successfully removed ${removeAddress} from admin!`);
      setRemoveAddress(""); // Clear input
    } catch (error) {
      console.error("Error removing admin:", error);
      setRemoveError(error.message || "Failed to remove admin");
    } finally {
      setRemoveLoading(false);
    }
  };

  /**
   * Handle checking if an address is admin
   */
  const handleCheckAdmin = async () => {
    setCheckResult(null);
    setCheckError("");

    if (!checkAddress.trim()) {
      setCheckError("Please enter a wallet address");
      return;
    }

    if (!isValidAddress(checkAddress.trim())) {
      setCheckError("Invalid Ethereum address format");
      return;
    }

    setCheckLoading(true);

    try {
      // Initialize contract before checking
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      await initAuthContract(contractAddress);
      const isAdmin = await checkIfAdmin(checkAddress.trim());
      setCheckResult(isAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setCheckError(error.message || "Failed to check admin status");
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: "bold" }}>
        Manage Administrators
      </Typography>

      {/* Add Admin Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Add New Admin
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the wallet address (public address) of the account you want to grant admin privileges.
          <strong> Never share or enter private keys!</strong>
        </Typography>

        <TextField
          label="Wallet Address (0x...)"
          placeholder="0x1234567890abcdef..."
          value={newAdminAddress}
          onChange={(e) => setNewAdminAddress(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          disabled={addLoading}
        />

        {addSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {addSuccess}
          </Alert>
        )}

        {addError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {addError}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddAdmin}
          disabled={addLoading}
          fullWidth
        >
          {addLoading ? <CircularProgress size={24} /> : "Add Admin"}
        </Button>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Remove Admin Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="error">
          Remove Admin
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the wallet address of the admin you want to revoke privileges from.
        </Typography>

        <TextField
          label="Wallet Address (0x...)"
          placeholder="0x1234567890abcdef..."
          value={removeAddress}
          onChange={(e) => setRemoveAddress(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          disabled={removeLoading}
        />

        {removeSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {removeSuccess}
          </Alert>
        )}

        {removeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {removeError}
          </Alert>
        )}

        <Button
          variant="contained"
          color="error"
          onClick={handleRemoveAdmin}
          disabled={removeLoading}
          fullWidth
        >
          {removeLoading ? <CircularProgress size={24} /> : "Remove Admin"}
        </Button>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Check Admin Status Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom color="info.main">
          Check Admin Status
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Verify if a wallet address has admin privileges.
        </Typography>

        <TextField
          label="Wallet Address (0x...)"
          placeholder="0x1234567890abcdef..."
          value={checkAddress}
          onChange={(e) => setCheckAddress(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          disabled={checkLoading}
        />

        {checkResult !== null && (
          <Alert severity={checkResult ? "success" : "info"} sx={{ mb: 2 }}>
            {checkResult
              ? `✅ ${checkAddress} IS an admin`
              : `❌ ${checkAddress} is NOT an admin`}
          </Alert>
        )}

        {checkError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {checkError}
          </Alert>
        )}

        <Button
          variant="outlined"
          color="info"
          onClick={handleCheckAdmin}
          disabled={checkLoading}
          fullWidth
        >
          {checkLoading ? <CircularProgress size={24} /> : "Check Status"}
        </Button>
      </Paper>

      {/* Security Notice */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight="bold">
          🔐 Security Note:
        </Typography>
        <Typography variant="body2">
          • Only use wallet addresses (public addresses starting with 0x)
          <br />
          • Never enter or share private keys
          <br />
          • Admin privileges grant full control over the election system
          <br />• Only grant admin access to trusted individuals
        </Typography>
      </Alert>
    </Box>
  );
}

export default ManageAdmin;

