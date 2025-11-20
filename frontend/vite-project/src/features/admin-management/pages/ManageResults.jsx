"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../../contexts/AuthProvider.jsx"
import {
  fetchElections,
  initElectionManagerContract,
  getElectionResults,
  isResultsPublished,
  publishResults,
} from "../../election/services/electionServices.js"
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
} from "@mui/material"

export default function ManageResults() {
  const { account, isAdmin } = useAuth()
  const now = Math.floor(Date.now() / 1000)

  const [expiredElections, setExpiredElections] = useState([])
  const [resultsMap, setResultsMap] = useState({})
  const [publishedMap, setPublishedMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!account || !isAdmin) return
    ;(async () => {
      setLoading(true)
      try {
        await initElectionManagerContract(import.meta.env.VITE_ELECTION_MANAGER_ADDRESS)
        const all = await fetchElections(account)
        const expired = all.filter((e) => now > e.endTime)
        setExpiredElections(expired)

        
        const flags = await Promise.all(expired.map(async (e) => [e.id, await isResultsPublished(e.id)]))
        setPublishedMap(Object.fromEntries(flags))
      } catch (err) {
        setError(err.message || "Failed to load elections")
      } finally {
        setLoading(false)
      }
    })()
  }, [account, isAdmin, now])

  const handleRecordResult = async (election) => {
    setError("")
    setMessage("")
    try {
      const { candidates, counts, isDraw, winner } = await getElectionResults(election.id)

      setResultsMap((m) => ({
        ...m,
        [election.id]: { candidates, counts, isDraw, winner },
      }))
      setMessage(
        isDraw
          ? `Election ${election.id} is a draw between: ${candidates.join(", ")}`
          : `Winner for election ${election.id}: ${winner}`,
      )
    } catch (err) {
      setError(err.message || "Failed to fetch results")
    }
  }

  const handlePublish = async (election) => {
    setError("")
    setMessage("")
    setLoading(true)
    try {
      await publishResults(election.id)
      setPublishedMap((m) => ({ ...m, [election.id]: true }))
      setMessage(`Results for election ${election.id} published on-chain!`)
    } catch (err) {
      setError(err.message || "Failed to publish results")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: { xs: 2, sm: 4 },
        bgcolor: "background.default",
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 },
        borderRadius: 3,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          color: "primary.main",
          fontWeight: "bold",
          mb: 3,
        }}
      >
        Manage Election Results
      </Typography>

      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            minHeight: "200px",
            flexDirection: "column",
          }}
        >
          <CircularProgress color="primary" size={60} thickness={4} />
          <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
            Processing...
          </Typography>
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
        ? expiredElections.map((e) => {
            const res = resultsMap[e.id]
            const published = publishedMap[e.id]
            return (
              <Card
                key={e.id}
                sx={{
                  mb: 3,
                  boxShadow: 3,
                  borderRadius: 3,
                  border: published ? "1px solid" : "none",
                  borderColor: published ? "success.light" : "transparent",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" sx={{ color: "primary.main", fontWeight: "bold" }}>
                    {e.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {e.description}
                  </Typography>

                  <Box
                    sx={{
                      p: 2,
                      mb: 3,
                      bgcolor: "background.default",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      <strong>Expired on:</strong> {new Date(e.endTime * 1000).toLocaleString()}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, mt: { xs: 1, sm: 0 } }}>
                      {!res && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleRecordResult(e)}
                          startIcon={
                            <span role="img" aria-label="Check">
                              ✓
                            </span>
                          }
                          aria-label="Check election results"
                        >
                          Check Results
                        </Button>
                      )}

                      {res && !published && (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handlePublish(e)}
                          startIcon={
                            <span role="img" aria-label="Publish">
                              📢
                            </span>
                          }
                          aria-label="Publish election results"
                        >
                          Publish Results
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {published && (
                    <Alert
                      severity="success"
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                      }}
                      icon={
                        <span role="img" aria-label="Published">
                          ✅
                        </span>
                      }
                    >
                      Results published on-chain
                    </Alert>
                  )}

                  {res && (
                    <>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "medium" }}>
                        Results:
                      </Typography>
                      <List
                        dense
                        sx={{
                          bgcolor: "background.default",
                          borderRadius: 2,
                          mb: 2,
                          overflow: "hidden",
                        }}
                      >
                        {res.candidates.map((cand, idx) => (
                          <ListItem
                            key={idx}
                            sx={{
                              borderBottom: idx < res.candidates.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                              bgcolor: res.winner === cand && !res.isDraw ? "success.light" : "transparent",
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body1"
                                  fontWeight={res.winner === cand && !res.isDraw ? "bold" : "regular"}
                                >
                                  {cand}
                                </Typography>
                              }
                              secondary={`${res.counts[idx]} vote${res.counts[idx] === 1 ? "" : "s"}`}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Box
                        sx={{
                          p: 2,
                          bgcolor: res.isDraw ? "warning.light" : "success.light",
                          borderRadius: 2,
                          textAlign: "center",
                        }}
                      >
                        {res.isDraw ? (
                          <Typography variant="body1" sx={{ color: "warning.dark", fontWeight: "medium" }}>
                            ⚖️ It's a draw between: {res.candidates.join(", ")}
                          </Typography>
                        ) : (
                          <Typography variant="body1" sx={{ color: "success.dark", fontWeight: "medium" }}>
                            🏆 Winner: {res.winner}
                          </Typography>
                        )}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })
        : null}

      {expiredElections.length === 0 && !loading && (
        <Box
          textAlign="center"
          sx={{
            py: 6,
            px: 2,
            bgcolor: "background.paper",
            borderRadius: 3,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No expired elections found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Elections will appear here after they expire
          </Typography>
        </Box>
      )}
    </Container>
  )
}
