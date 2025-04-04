import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  initElectionManagerContract,
  createElection,
} from "../../../election/services/electionServices";

function CreateElection() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [candidates, setCandidates] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setMessage("");
      // Convert comma-separated candidate addresses into an array.
      const candidatesArray = candidates
        .split(",")
        .map((addr) => addr.trim())
        .filter((addr) => addr !== "");

      // Convert datetime-local input to Unix timestamps.
      const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);

      // Get the ElectionManager contract address from environment variables.
      const contractAddress = import.meta.env.VITE_ELECTION_MANAGER_ADDRESS;
      console.log("ElectionManager Address from env:", contractAddress);
      await initElectionManagerContract(contractAddress);
      await createElection(
        title,
        description,
        candidatesArray,
        startTimestamp,
        endTimestamp
      );
      setMessage("Election created successfully!");
      // Navigate back to the admin dashboard.
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Failed to create election");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 4,
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        sx={{ color: "#1976d2" }}
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
        />
        <TextField
          label="Candidates (comma separated addresses)"
          fullWidth
          required
          margin="normal"
          value={candidates}
          onChange={(e) => setCandidates(e.target.value)}
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
        />
        <Box textAlign="center" mt={2}>
          <Button variant="contained" color="primary" type="submit">
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
  );
}

export default CreateElection;
