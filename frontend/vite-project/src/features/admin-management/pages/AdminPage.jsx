import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthProvider.jsx";
import { Container, Box, Typography, Button } from "@mui/material";

function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        bgcolor: "#f0f4f8",
        py: 4,
        borderRadius: 2,
      }}
    >
      <Box textAlign="center" mb={4}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: "#1976d2" }}
        >
          Admin Dashboard
        </Typography>
      </Box>
      <Box display="flex" justifyContent="center" gap={2} mb={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("create-election")}
        >
          Create Election
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("manage-results")}
        >
          Manage Results
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("manage-admin")}
        >
          Manage Admin
        </Button>
      </Box>
      <Outlet />
    </Container>
  );
}

export default AdminPage;
