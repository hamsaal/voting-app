"use client"

import { Navigate, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../../../contexts/AuthProvider.jsx"
import { Container, Box, Typography, Button } from "@mui/material"

function AdminPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  if (!isAdmin) {
    return <Navigate to="/" replace />
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
          Admin Dashboard
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
