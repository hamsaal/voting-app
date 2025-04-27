

import { Navigate } from "react-router-dom"
import { Container, Box, Typography, Button, Alert, CircularProgress } from "@mui/material"
import { useAuth } from "../../../contexts/AuthProvider"

function Login() {
  const { account, isOnDesiredNetwork, isLoading, error, connectWallet } = useAuth()

  // While checking admin status, show a loader.
  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: { xs: 4, sm: 8 } }}>
        <Box
          textAlign="center"
          sx={{
            p: 4,
            bgcolor: "#ffffff",
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: "text.primary" }}>
            Checking admin status...
          </Typography>
        </Box>
      </Container>
    )
  }

  // If already connected and on the correct network, redirect to home.
  if (account && isOnDesiredNetwork) {
    return <Navigate to="/" replace />
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: { xs: 4, sm: 8 },
        p: { xs: 3, sm: 4 },
        bgcolor: "#ffffff",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
          Welcome to Voting App
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: "400px", mx: "auto" }}>
          Please login with MetaMask to continue.
        </Typography>
      </Box>
      <Box textAlign="center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={connectWallet}
          sx={{
            py: 1.5,
            px: 4,
            fontSize: "1.1rem",
          }}
          startIcon={
            <span role="img" aria-label="Wallet">
              👛
            </span>
          }
        >
          Log In with MetaMask
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Container>
  )
}

export default Login
