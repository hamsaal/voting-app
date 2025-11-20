"use client"

import { Navigate, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../../../contexts/AuthProvider.jsx"
import { Container, Box, Typography, Button, Alert, Chip, Paper, CircularProgress } from "@mui/material"

function AdminPage() {
  const { isAdmin, isLoading, account, isOnDesiredNetwork, chainId, logout, error } = useAuth()
  const navigate = useNavigate()

  
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Verifying admin access...</Typography>
      </Container>
    )
  }

  if (!account) {
    return <Navigate to="/login" replace />
  }


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
          <Button variant="contained" onClick={logout} sx={{ mt: 2 }}>
            Logout
          </Button>
        </Alert>
      </Container>
    )
  }

  
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: { xs: 2, sm: 4 },
        bgcolor: "background.default",
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 4 },
        borderRadius: 3,
      }}
    >
      {/* Header with account info and logout */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: "primary.dark" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
              🔐 Admin Dashboard
            </Typography>
            <Chip 
              label={`${account.slice(0, 6)}...${account.slice(-4)}`} 
              size="small" 
              sx={{ bgcolor: "success.main", color: "white" }}
            />
            <Chip 
              label="Admin" 
              size="small" 
              color="success"
              sx={{ ml: 1 }}
            />
          </Box>
          <Button 
            variant="contained" 
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

      <Box textAlign="center" mb={4}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            color: "primary.main",
            fontWeight: "bold",
          }}
        >
          Management Console
        </Typography>
      </Box>
      <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="center" gap={2} mb={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("create-election")}
          fullWidth={false}
          startIcon={
            <span role="img" aria-label="Create">
              ➕
            </span>
          }
          sx={{ minWidth: { xs: "100%", sm: "auto" } }}
        >
          Create Election
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("manage-results")}
          fullWidth={false}
          startIcon={
            <span role="img" aria-label="Results">
              📊
            </span>
          }
          sx={{ minWidth: { xs: "100%", sm: "auto" } }}
        >
          Manage Results
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("manage-admin")}
          fullWidth={false}
          startIcon={
            <span role="img" aria-label="Admin">
              👤
            </span>
          }
          sx={{ minWidth: { xs: "100%", sm: "auto" } }}
        >
          Manage Admin
        </Button>
      </Box>
      <Outlet />
    </Container>
  )
}

export default AdminPage
