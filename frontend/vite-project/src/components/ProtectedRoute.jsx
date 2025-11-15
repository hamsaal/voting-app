import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider.jsx";
import { Container, CircularProgress, Typography, Alert, Button } from "@mui/material";

/**
 * ProtectedRoute - Enhanced security wrapper for protected routes
 * 
 * Features:
 * - Enforces authentication
 * - Validates network connection
 * - Enforces admin-only access when required
 * - Shows appropriate loading/error states
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.requireAdmin - If true, requires admin privileges
 * @param {string} props.redirectTo - Where to redirect unauthorized users (default: "/login")
 */
function ProtectedRoute({ children, requireAdmin = false, redirectTo = "/login" }) {
  const { 
    account, 
    isAdmin, 
    isLoading, 
    isOnDesiredNetwork, 
    chainId,
    logout 
  } = useAuth();

  // SECURITY CHECK 1: Show loading state while verifying
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Verifying {requireAdmin ? "admin" : ""} access...
        </Typography>
      </Container>
    );
  }

  // SECURITY CHECK 2: Must have connected account
  if (!account) {
    console.warn("❌ ProtectedRoute: No account connected");
    return <Navigate to={redirectTo} replace />;
  }

  // SECURITY CHECK 3: Must be on correct network
  if (!isOnDesiredNetwork) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Wrong Network Detected
          </Typography>
          <Typography>
            You must be connected to the Hardhat Local network (Chain ID: 31337).
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
            Current Chain ID: {chainId || "Unknown"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Please switch networks in MetaMask and refresh the page.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              logout();
              window.location.href = redirectTo;
            }} 
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Alert>
      </Container>
    );
  }

  // SECURITY CHECK 4: If admin required, enforce it
  if (requireAdmin && !isAdmin) {
    console.warn("❌ ProtectedRoute: Admin access required but user is not admin");
    return <Navigate to="/" replace />;
  }

  // All security checks passed - render children
  return <>{children}</>;
}

export default ProtectedRoute;

