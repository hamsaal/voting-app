import { Navigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../../contexts/AuthProvider";

function Login() {
  const { account, isOnDesiredNetwork, isLoading, error, connectWallet } =
    useAuth();

  // While checking admin status, show a loader.
  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box textAlign="center">
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Checking admin status...
          </Typography>
        </Box>
      </Container>
    );
  }

  // If already connected and on the correct network, redirect to home.
  if (account && isOnDesiredNetwork) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 8,
        p: 4,
        bgcolor: "#f5f5f5",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Welcome to Voting App
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Please login with MetaMask to continue.
        </Typography>
      </Box>
      <Box textAlign="center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={connectWallet}
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
  );
}

export default Login;
