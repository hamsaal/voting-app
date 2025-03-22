import ReactDOM from "react-dom/client";
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./features/user-auth/pages/Login.jsx";
import Error from "./pages/Error.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthProvider.jsx";

function PrivateRoute({ children }) {
  const { account } = useAuth();
  if (!account) {
    return <Navigate to="/login" replace />;
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
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
