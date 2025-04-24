import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import { useAuth } from "../contexts/AuthProvider.jsx";
import {
  fetchElections,
  initElectionManagerContract,
  vote,
} from "../features/election/services/electionServices.js";
import CountdownTimer from "../components/CountdownTimer";

function Home() {
  const { account, chainId, isAdmin } = useAuth();
  const [elections, setElections] = useState([]);
  const [loadingElections, setLoadingElections] = useState(false);
  const [error, setError] = useState("");
  const [voteError, setVoteError] = useState("");
  const [voteMessage, setVoteMessage] = useState("");

  useEffect(() => {
    // Only load elections if account is defined
    if (!account) {
      console.warn("No account available, skipping elections fetch.");
      return;
    }
    const loadElections = async () => {
      setLoadingElections(true);
      try {
        const contractAddress = import.meta.env.VITE_ELECTION_MANAGER_ADDRESS;
        if (!contractAddress) {
          throw new Error(
            "Contract address not found in environment variables."
          );
        }
        await initElectionManagerContract(contractAddress);
        const fetchedElections = await fetchElections(account);
        setElections(fetchedElections);
      } catch (err) {
        console.error("Error loading elections:", err);
        setError(err.message || "Failed to load elections");
      } finally {
        setLoadingElections(false);
      }
    };

    loadElections();
  }, [account]);

  const handleVote = async (electionId, candidateIndex) => {
    setVoteError("");
    setVoteMessage("");
    try {
      await vote(electionId, candidateIndex);
      setVoteMessage("Vote recorded successfully!");
      // Refresh elections to update vote status.
      const contractAddress = import.meta.env.VITE_ELECTION_MANAGER_ADDRESS;
      await initElectionManagerContract(contractAddress);
      const fetchedElections = await fetchElections(account);
      setElections(fetchedElections);
    } catch (err) {
      console.error("Error recording vote:", err);
      setVoteError(err.message || "Failed to record vote");
    }
  };

  const now = Math.floor(Date.now() / 1000);

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
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: "#1976d2" }}
        >
          Home Page
        </Typography>
        <Typography variant="body1" sx={{ color: "#333" }}>
          <strong>Wallet:</strong> {account} | <strong>Chain ID:</strong>{" "}
          {chainId}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#555" }}>
          {isAdmin ? "You have admin privileges." : "You are a normal user."}
        </Typography>
      </Box>
      {voteMessage && <Alert severity="success">{voteMessage}</Alert>}
      {voteError && <Alert severity="error">{voteError}</Alert>}
      <Box mb={4}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ color: "#1976d2" }}
        >
          Current Elections
        </Typography>
        {loadingElections && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress sx={{ color: "#1976d2" }} />
          </Box>
        )}
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        {elections.length > 0
          ? elections.map((election) => {
              const isActive = election.active && now < election.endTime;
              return (
                <Card
                  key={election.id}
                  sx={{
                    mb: 2,
                    boxShadow: 3,
                    borderRadius: 2,
                    opacity: isActive ? 1 : 0.6,
                  }}
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
                    <Typography variant="body2" sx={{ color: "#333" }}>
                      <strong>Start:</strong>{" "}
                      {new Date(election.startTime * 1000).toLocaleString()}
                      <br />
                      <strong>End:</strong>{" "}
                      {new Date(election.endTime * 1000).toLocaleString()}
                    </Typography>
                    <Box mt={1}>
                      <CountdownTimer endTime={election.endTime} />
                    </Box>
                    {isActive ? (
                      <>
                        {election.hasVoted ? (
                          <Typography
                            variant="body2"
                            sx={{ color: "gray", mt: 2 }}
                          >
                            You have already voted.
                          </Typography>
                        ) : (
                          <Box mt={2}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Vote for your candidate:
                            </Typography>
                            {(election.candidates || []).map(
                              (candidate, idx) => (
                                <Button
                                  key={idx}
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  sx={{ mr: 1, mb: 1 }}
                                  onClick={() => handleVote(election.id, idx)}
                                >
                                  {candidate}
                                </Button>
                              )
                            )}
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ color: "gray", mt: 2 }}>
                        Voting closed.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              );
            })
          : !loadingElections && (
              <Typography variant="body1" sx={{ color: "#333" }}>
                No elections available
              </Typography>
            )}
      </Box>
    </Container>
  );
}

export default Home;
