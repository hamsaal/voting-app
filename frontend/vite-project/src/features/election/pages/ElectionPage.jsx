import { useEffect, useState } from "react";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../../contexts/AuthProvider.jsx";
import { fetchElections, initElectionManagerContract } from "../services/electionServices.js";
import ElectionCard from "./ElectionCard.jsx";


export default function ElectionPage() {
  const { account, chainId, isAdmin } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadElections = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const contractAddress = import.meta.env.VITE_ELECTION_MANAGER_ADDRESS;
      if (!contractAddress) throw new Error("Contract address not found in environment variables.");
      await initElectionManagerContract(contractAddress);
      const data = await fetchElections(account);
      setElections(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElections();
  }, [account]);

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        bgcolor: "#f0f4f8",
        py: 4,
        px: { xs: 2, md: 4 },
        borderRadius: 2,
      }}
    >
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" gutterBottom sx={{ color: "#1976d2" }}>
          Current Elections
        </Typography>
        <Typography variant="body1" sx={{ color: "#333" }}>
          <strong>Wallet:</strong> {account} | <strong>Chain ID:</strong> {chainId}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#555" }}>
          {isAdmin ? "You have admin privileges." : "You are a normal user."}
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {elections.length > 0 ? (
        elections.map((e) => (
          <ElectionCard
            key={e.id}
            election={e}
            account={account}
            isAdmin={isAdmin}
            onVote={loadElections}
          />
        ))
      ) : (
        !loading && (
          <Typography variant="body1" sx={{ color: "#333" }}>
            No elections available
          </Typography>
        )
      )}
    </Container>
  );
}