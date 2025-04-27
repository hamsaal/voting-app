// src/features/election/pages/ElectionPage.jsx
import React, { useEffect, useState } from "react"
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Alert,
  Card,
  CardContent
} from "@mui/material"
import { useAuth } from "../../../contexts/AuthProvider.jsx"
import {
  fetchElections,
  initElectionManagerContract,
  isResultsPublished,
  getPublishedResults
} from "../services/electionServices.js"
import ElectionCard from "./ElectionCard.jsx"

export default function ElectionPage() {
  const { account, chainId, isAdmin } = useAuth()
  const [viewPublished, setViewPublished] = useState(false)
  const [allElections, setAllElections] = useState([])
  const [publishedElections, setPublishedElections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // "now" ticks every second so UI updates live
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  useEffect(() => {
    const iv = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  const loadData = async () => {
    if (!account) return
    setLoading(true)
    setError("")
    try {
      const address = import.meta.env.VITE_ELECTION_MANAGER_ADDRESS
      await initElectionManagerContract(address)
      const all = await fetchElections(account)

      if (viewPublished) {
        // load published results
        const flags = await Promise.all(
          all.map(async (e) => [e.id, await isResultsPublished(e.id)])
        )
        const publishedIds = flags.filter(([, f]) => f).map(([id]) => id)
        const data = await Promise.all(
          publishedIds.map(async (id) => {
            const meta = all.find((e) => e.id === id)
            const result = await getPublishedResults(id)
            return {
              ...meta,
              candidates: result.candidates.length ? result.candidates : meta.candidates,
              counts:     result.counts.length     ? result.counts     : meta.voteCounts,
              isDraw:     result.isDraw,
              winner:     result.winner
            }
          })
        )
        setPublishedElections(data)
      } else {
        // keep full list for deriving upcoming/live
        setAllElections(all)
      }
    } catch (err) {
      setError(err.message || "Failed to load elections")
    } finally {
      setLoading(false)
    }
  }

  // reload whenever account or view toggles
  useEffect(() => {
    loadData()
  }, [account, viewPublished])

  // derive upcoming & live from allElections + now
  const upcomingElections = allElections.filter(e => now < e.startTime)
  const liveElections     = allElections.filter(e => now >= e.startTime && now <= e.endTime)

  return (
    <Container maxWidth="md" sx={{ mt:4, py:4 }}>
      <Box display="flex" justifyContent="center" gap={2} mb={4}>
        <Button
          variant={!viewPublished ? "contained" : "outlined"}
          onClick={() => setViewPublished(false)}
        >
          Current Elections
        </Button>
        <Button
          variant={viewPublished ? "contained" : "outlined"}
          onClick={() => setViewPublished(true)}
        >
          Published Elections
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mb={4}>
          <CircularProgress size={48} />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb:4 }}>{error}</Alert>}

      {!loading && !error && viewPublished && (
        // --- Published View ---
        (publishedElections.length > 0 ? (
          publishedElections.map((e) => (
            <Card key={e.id} sx={{ mb:3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight:"bold", mb:2 }}>
                  {e.title}
                </Typography>
                <Box component="ul" sx={{ p:0, m:0, listStyle:"none" }}>
                  {e.candidates.map((cand, idx) => (
                    <Box
                      component="li"
                      key={idx}
                      sx={{
                        display:"flex",
                        justifyContent:"space-between",
                        py:1,
                        borderBottom: idx < e.candidates.length-1 
                          ? "1px solid rgba(0,0,0,0.06)" 
                          : "none"
                      }}
                    >
                      <Typography fontWeight={e.winner===cand?"bold":"regular"}>
                        {cand}
                      </Typography>
                      <Typography color="text.secondary">
                        {e.counts[idx] ?? 0} vote{e.counts[idx]===1?"":"s"}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box 
                  mt={2} 
                  p={1.5} 
                  bgcolor={e.isDraw?"warning.light":"success.light"} 
                  borderRadius={1}
                >
                  {e.isDraw 
                    ? <Typography color="warning.dark">⚖️ It’s a draw</Typography>
                    : <Typography color="success.dark">🏆 Winner: {e.winner}</Typography>
                  }
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography align="center">No published elections</Typography>
        ))
      )}

      {!loading && !error && !viewPublished && (
        // --- Upcoming + Live ---
        <>
          {upcomingElections.length > 0 && (
            <>
              <Typography variant="h5" sx={{ mb:2 }}>Upcoming Elections</Typography>
              {upcomingElections.map((e) => (
                <ElectionCard
                  key={e.id}
                  election={e}
                  account={account}
                  isAdmin={isAdmin}
                  onVote={loadData}
                />
              ))}
            </>
          )}

          {liveElections.length > 0 ? (
            <>
              <Typography variant="h5" sx={{ mt:4, mb:2 }}>Live Elections</Typography>
              {liveElections.map((e) => (
                <ElectionCard
                  key={e.id}
                  election={e}
                  account={account}
                  isAdmin={isAdmin}
                  onVote={loadData}
                />
              ))}
            </>
          ) : (
            <Typography align="center" sx={{ mt:4 }}>
              {upcomingElections.length 
                ? "No live elections yet. Stay tuned!"
                : "No current elections."
              }
            </Typography>
          )}
        </>
      )}
    </Container>
  )
}
