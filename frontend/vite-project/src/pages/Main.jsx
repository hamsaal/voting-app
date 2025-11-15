import { useAuth } from "../contexts/AuthProvider.jsx";
import { Navigate, useNavigate } from "react-router-dom";
import ElectionPage from "../features/election/pages/ElectionPage.jsx";
import { Container, Alert, CircularProgress, Typography, Box, Button, Paper, Chip } from "@mui/material";

function Main() {
  const { account, isAdmin, isLoading, error, logout, isOnDesiredNetwork, chainId } = useAuth();
  const navigate = useNavigate();

  // SECURITY: Show loading state while verifying
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Verifying authentication...</Typography>
      </Container>
    );
  }

  // SECURITY: Must be connected
  if (!account) {
    return <Navigate to="/login" replace />;
  }

  // SECURITY: Must be on correct network
  if (!isOnDesiredNetwork) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>Wrong Network</Typography>
          <Typography>
            Please switch to the Hardhat Local network (Chain ID: 31337) in MetaMask.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Current Chain ID: {chainId}
          </Typography>
          <Button variant="contained" onClick={() => { logout(); navigate("/login"); }} sx={{ mt: 2 }}>
            Logout
          </Button>
        </Alert>
      </Container>
    );
  }

  // SECURITY: If admin, redirect to admin dashboard
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Regular user view
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header with account info */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Voting Dashboard
            </Typography>
            <Chip 
              label={`${account.slice(0, 6)}...${account.slice(-4)}`} 
              size="small" 
              color="primary"
            />
            <Chip 
              label="Voter" 
              size="small" 
              color="info"
              sx={{ ml: 1 }}
            />
          </Box>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleLogout}
            size="small"
          >
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Election Page Content */}
      <ElectionPage />
    </Container>
  );
}

export default Main;
