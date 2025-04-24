import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthProvider.jsx";
import {
  fetchElections,
  initElectionManagerContract,
  getElectionResults
} from "../../election/services/electionServices.js";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function ManageResults() {
  const { account, isAdmin } = useAuth();
  const now = Math.floor(Date.now() / 1000);

  const [expiredElections, setExpiredElections] = useState([]);
  const [resultsMap, setResultsMap] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!account || !isAdmin) return;
    (async () => {
      setLoading(true);
      try {
        await initElectionManagerContract(
          import.meta.env.VITE_ELECTION_MANAGER_ADDRESS
        );
        const all = await fetchElections(account);
        setExpiredElections(all.filter(e => now > e.endTime));
      } catch (err) {
        setError(err.message || "Failed to load elections");
      } finally {
        setLoading(false);
      }
    })();
  }, [account, isAdmin, now]);

  const handleRecordResult = async (election) => {
    setError(""); setMessage("");
    try {
      const { candidates, counts, isDraw, winner } =
        await getElectionResults(election.id);

      // store the full result object
      setResultsMap(m => ({
        ...m,
        [election.id]: { candidates, counts, isDraw, winner }
      }));
      setMessage(
        isDraw
          ? `Election ${election.id} is a draw between: ${candidates.join(", ")}`
          : `Winner for election ${election.id}: ${winner}`
      );
    } catch (err) {
      setError(err.message || "Failed to fetch results");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt:4, bgcolor:"#f0f4f8", py:4, borderRadius:2 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color:"#1976d2" }}>
        Manage Election Results
      </Typography>

      {loading && 
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress sx={{ color:"#1976d2" }} />
        </Box>
      }
      {error   && <Alert severity="error"   sx={{ mt:2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mt:2 }}>{message}</Alert>}

      {expiredElections.length > 0 ? (
        expiredElections.map(e => {
          const res = resultsMap[e.id];
          return (
            <Card key={e.id} sx={{ mb:2, boxShadow:3, borderRadius:2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color:"#1976d2" }}>
                  {e.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb:1 }}>
                  {e.description}
                </Typography>
                <Typography variant="body2" sx={{ mb:2 }}>
                  <strong>Expired on:</strong>{" "}
                  {new Date(e.endTime * 1000).toLocaleString()}
                </Typography>

                {/** Button to fetch full results **/}
                {!res && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRecordResult(e)}
                  >
                    Check Results
                  </Button>
                )}

                {/** Display the breakdown once we have it **/}
                {res && (
                  <>
                    <List dense>
                      {res.candidates.map((cand, idx) => (
                        <ListItem key={idx}>
                          <ListItemText
                            primary={cand}
                            secondary={`${res.counts[idx]} vote${
                              res.counts[idx] === 1 ? "" : "s"
                            }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {res.isDraw ? (
                      <Typography variant="body1" sx={{ mt:2, color:"#d97706" }}>
                        It's a draw between: {res.candidates.join(", ")}
                      </Typography>
                    ) : (
                      <Typography variant="body1" sx={{ mt:2, color:"#059669" }}>
                        🏆 Winner: {res.winner}
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        !loading && (
          <Typography variant="body1" align="center">
            No expired elections found.
          </Typography>
        )
      )}
    </Container>
  );
}
