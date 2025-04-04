import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  fetchElections,
  initElectionManagerContract,
  computeWinner,
} from "../../../election/services/electionServices";

function ManageResults() {
  const [expiredElections, setExpiredElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [winnerMap, setWinnerMap] = useState({});

  useEffect(() => {
    const loadExpiredElections = async () => {
      setLoading(true);
      try {
        const contractAddress = import.meta.env.VITE_ELECTION_MANAGER_ADDRESS;
        await initElectionManagerContract(contractAddress);
        const elections = await fetchElections();
        const now = Math.floor(Date.now() / 1000);
        const expired = elections.filter((election) => election.endTime < now);
        setExpiredElections(expired);
      } catch (err) {
        setError(err.message || "Failed to load elections");
      } finally {
        setLoading(false);
      }
    };
    loadExpiredElections();
  }, []);

  const handleRecordResult = async (electionId) => {
    setMessage("");
    setError("");
    try {
      const winner = await computeWinner(electionId);
      setWinnerMap((prev) => ({ ...prev, [electionId]: winner }));
      setMessage(
        `Result recorded for election ID ${electionId}: Winner is ${winner}`
      );
    } catch (err) {
      setError(err.message || "Failed to record result");
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{ mt: 4, bgcolor: "#f0f4f8", py: 4, borderRadius: 2 }}
    >
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        sx={{ color: "#1976d2" }}
      >
        Manage Election Results
      </Typography>
      {loading && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress sx={{ color: "#1976d2" }} />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
      {expiredElections.length > 0
        ? expiredElections.map((election) => (
            <Card
              key={election.id}
              sx={{ mb: 2, boxShadow: 3, borderRadius: 2 }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: "#1976d2" }}>
                  {election.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {election.description}
                </Typography>
                <Typography variant="body2">
                  <strong>Expired on:</strong>{" "}
                  {new Date(election.endTime * 1000).toLocaleString()}
                </Typography>
                {winnerMap[election.id] && (
                  <Typography variant="body2" sx={{ mt: 1, color: "#1976d2" }}>
                    Winner: {winnerMap[election.id]}
                  </Typography>
                )}
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRecordResult(election.id)}
                  >
                    Record Result
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))
        : !loading && (
            <Typography variant="body1" align="center">
              No expired elections found.
            </Typography>
          )}
    </Container>
  );
}

export default ManageResults;
