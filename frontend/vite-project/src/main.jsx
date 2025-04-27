import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
theme
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import Main from "./pages/Main.jsx";
import Login from "./features/user-auth/pages/Login.jsx";
import Error from "./pages/Error.jsx";
import AdminPage from "./features/admin-management/pages/AdminPage.jsx";
import CreateElection from "./features/admin-management/pages/CreateElection.jsx";
import ManageResults from "./features/admin-management/pages/ManageResults.jsx";
import theme from "./theme/theme.js";

const router = createBrowserRouter([
  { path: "/", element: <Main />, errorElement: <Error /> },
  { path: "/login", element: <Login />, errorElement: <Error /> },
  {
    path: "/admin",
    element: <AdminPage />,
    errorElement: <Error />,
    children: [
      { path: "create-election", element: <CreateElection /> },
      { path: "manage-results", element: <ManageResults /> },
      { path: "manage-admin", element: <div>Manage Admin</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstarts an elegant, consistent, baseline to build upon. */}
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
