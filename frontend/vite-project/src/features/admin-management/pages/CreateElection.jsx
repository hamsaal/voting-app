
import { useState } from "react"
import { Container, Typography, TextField, Button, Box, Alert } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { initElectionManagerContract, createElection } from "../../election/services/electionServices"

function CreateElection() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [candidates, setCandidates] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {}
    if (!title.trim()) errors.title = "Title is required"
    if (!description.trim()) errors.description = "Description is required"
    if (!candidates.trim()) errors.candidates = "At least one candidate is required"
    if (!startTime) errors.startTime = "Start time is required"
    if (!endTime) errors.endTime = "End time is required"
    else if (new Date(startTime) >= new Date(endTime)) errors.endTime = "End time must be later than start time"
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    try {
      setError("")
      setMessage("")
      setFieldErrors({})
      const candidatesArray = candidates
        .split(",")
        .map((val) => val.trim())
        .filter((val) => val !== "")
      const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000)
      const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000)
      const contractAddress = import.meta.env.VITE_ELECTION_MANAGER_ADDRESS
      await initElectionManagerContract(contractAddress)
      await createElection(title, description, candidatesArray, startTimestamp, endTimestamp)
      setMessage("Election created successfully!")
      navigate("/admin")
    } catch (err) {
      setError(err.message || "Failed to create election")
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: { xs: 2, sm: 4 },
        p: { xs: 2, sm: 3 },
        boxShadow: 3,
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        sx={{
          color: "primary.main",
          fontWeight: "bold",
          mb: 3,
        }}
      >
        Create Election
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Title"
          fullWidth
          required
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={Boolean(fieldErrors.title)}
          helperText={fieldErrors.title}
          aria-label="Election title"
        />
        <TextField
          label="Description"
          fullWidth
          required
          margin="normal"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={Boolean(fieldErrors.description)}
          helperText={fieldErrors.description}
          aria-label="Election description"
        />
        <TextField
          label="Candidates (comma separated names/numbers)"
          fullWidth
          required
          margin="normal"
          value={candidates}
          onChange={(e) => setCandidates(e.target.value)}
          error={Boolean(fieldErrors.candidates)}
          helperText={fieldErrors.candidates}
          aria-label="Election candidates"
        />
        <TextField
          label="Start Time"
          type="datetime-local"
          fullWidth
          required
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          error={Boolean(fieldErrors.startTime)}
          helperText={fieldErrors.startTime}
          aria-label="Election start time"
        />
        <TextField
          label="End Time"
          type="datetime-local"
          fullWidth
          required
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          error={Boolean(fieldErrors.endTime)}
          helperText={fieldErrors.endTime}
          aria-label="Election end time"
        />
        <Box textAlign="center" mt={2}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            size="large"
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: "medium",
            }}
          >
            Create Election
          </Button>
        </Box>
      </Box>
      {message && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  )
}

export default CreateElection
