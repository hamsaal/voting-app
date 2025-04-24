import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import CountdownTimer from "../../../components/CountdownTimer.jsx";
import { vote, getVoteCount } from "../services/electionServices.js";

export default function ElectionCard({ election, onVote }) {
  const [counts, setCounts] = useState([]);
  const [hasVoted, setHasVoted] = useState(election.hasVoted);

  // Load & refresh vote counts every 5s
  useEffect(() => {
    let mounted = true;
    async function loadCounts() {
      const fresh = await Promise.all(
        election.candidates.map((_, idx) => getVoteCount(election.id, idx))
      );
      if (mounted) setCounts(fresh);
    }
    loadCounts();
    const iv = setInterval(loadCounts, 5000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [election.id]);

  // Vote handler
  const handleVote = async (idx) => {
    await vote(election.id, idx);
    setHasVoted(true);
    onVote();
  };

  // Determine if election is active
  const now = Math.floor(Date.now() / 1000);
  const isActive =
    now >= election.startTime && now <= election.endTime;

  return (
    <Card
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
          hasVoted ? (
            <Typography variant="body2" sx={{ color: "gray", mt: 2 }}>
              You have already voted.
            </Typography>
          ) : (
            <Box mt={2}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Vote for your candidate:
              </Typography>
              {election.candidates.map((candidate, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  onClick={() => handleVote(idx)}
                >
                  {candidate} ({counts[idx] ?? 0})
                </Button>
              ))}
            </Box>
          )
        ) : (
          <Typography variant="body2" sx={{ color: "gray", mt: 2 }}>
            Voting closed.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}