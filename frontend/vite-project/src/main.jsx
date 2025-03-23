// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthProvider.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Login from "./features/user-auth/pages/Login.jsx";
import Error from "./pages/Error.jsx";
// Import the new AdminPanel
import AdminPanel from "./pages/AdminPanel.jsx";

function PrivateRoute({ children }) {
  const { account, isOnDesiredNetwork } = useAuth();
  if (!account) {
    return <Navigate to="/login" replace />;
  }
  if (!isOnDesiredNetwork) {
    return <div>Please switch to the correct network.</div>;
  }
  return children;
}

function AdminRoute({ children }) {
  const { account, isOnDesiredNetwork, isAdmin } = useAuth();
  if (!account) {
    return <Navigate to="/login" replace />;
  }
  if (!isOnDesiredNetwork) {
    return <div>Please switch to the correct network.</div>;
  }
  if (!isAdmin) {
    return <div>Access Denied. Admins Only.</div>;
  }
  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    ),
    errorElement: <Error />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminPanel />
      </AdminRoute>
    ),
    errorElement: <Error />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
