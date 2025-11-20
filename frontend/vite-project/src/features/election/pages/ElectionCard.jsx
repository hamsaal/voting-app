import React, { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button
} from "@mui/material"
import CountdownTimer from "../../../components/CountdownTimer.jsx"
import { vote, getVoteCount } from "../services/electionServices.js"

export default function ElectionCard({ election, onVote }) {
  const [counts, setCounts] = useState([])
  const [hasVoted, setHasVoted] = useState(election.hasVoted)


  useEffect(() => {
    let mounted = true
    async function loadCounts() {
      const fresh = await Promise.all(
        election.candidates.map((_, idx) => getVoteCount(election.id, idx))
      )
      if (mounted) setCounts(fresh)
    }
    loadCounts()
    const iv = setInterval(loadCounts, 5000)
    return () => {
      mounted = false
      clearInterval(iv)
    }
  }, [election.id, election.candidates])

  const handleVote = async (idx) => {
    await vote(election.id, idx)
    setHasVoted(true)
    onVote()
  }

  const now = Math.floor(Date.now() / 1000)
  const isUpcoming = now < election.startTime
  const isActive   = now >= election.startTime && now <= election.endTime
  const isEnded    = now > election.endTime

  return (
    <Card sx={{ mb:3, boxShadow:3, borderRadius:2, opacity: isActive?1:0.7 }}>
      <CardContent sx={{ p:2 }}>
        <Typography variant="h6" sx={{ fontWeight:"bold", mb:1 }}>
          {election.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb:2 }}>
          {election.description}
        </Typography>

        <Box
          sx={{
            display:"flex",
            flexDirection:{ xs:"column", sm:"row" },
            justifyContent:"space-between",
            alignItems:{ xs:"flex-start", sm:"center" },
            bgcolor:"background.paper",
            p:2,
            borderRadius:1,
            mb:2
          }}
        >
          <Box>
            <Typography variant="body2">
              <strong>Start:</strong>{" "}
              {new Date(election.startTime*1000).toLocaleString()}
            </Typography>
            <Typography variant="body2">
              <strong>End:</strong>{" "}
              {new Date(election.endTime*1000).toLocaleString()}
            </Typography>
          </Box>
          <Box mt={{ xs:1, sm:0 }}>
            <CountdownTimer
              endTime={ isActive ? election.endTime : election.startTime }
              label={ isUpcoming ? "Starts in" : "Ends in" }
            />
          </Box>
        </Box>

        {isUpcoming && (
          <Typography align="center" color="text.secondary" sx={{ mb:2 }}>
            This election hasn’t started yet.
          </Typography>
        )}

        {isActive && (
          hasVoted ? (
            <Typography align="center" color="success.main" sx={{ mb:2 }}>
              ✓ You have already voted
            </Typography>
          ) : (
            <Box sx={{ display:"flex", flexWrap:"wrap", gap:1 }}>
              {election.candidates.map((cand, i) => (
                <Button
                  key={i}
                  variant="outlined"
                  onClick={() => handleVote(i)}
                >
                  {cand} ({counts[i] ?? 0})
                </Button>
              ))}
            </Box>
          )
        )}

        {isEnded && (
          <Typography align="center" color="text.secondary" sx={{ mt:2 }}>
            Voting closed
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
