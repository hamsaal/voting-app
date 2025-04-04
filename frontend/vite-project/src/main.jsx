import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider.jsx";

import Login from "./features/user-auth/pages/Login.jsx";
import Error from "./pages/Error.jsx";
import AdminPage from "./features/admin-management/pages/AdminPage.jsx";
import CreateElection from "./features/admin-management/pages/CreateElection.jsx";
import Main from "./pages/Main.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <Error />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
    errorElement: <Error />,
    children: [
      {
        path: "create-election",
        element: <CreateElection />,
      },
      {
        path: "manage-admin",
        element: <div>Manage Admin Page (To be implemented)</div>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
