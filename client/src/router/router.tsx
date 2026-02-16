import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../features/auth/Login";
import {
  AuthenticatedRoute,
  GuestRoute,
  ProtectedRoute,
} from "./ProtectedRoute";
import Register from "../features/auth/Register";
import Dashboard from "../features/dashboard/Dashboard";
import CreateCompany from "../features/company/pages/CreateCompany";
import ManageEmployees from "@/features/employees/pages/ManageEmployees";
import AddEmployee from "@/features/employees/pages/AddEmployee";
import Departments from "@/features/departments/pages/Departments";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  // Auth Routes
  {
    path: "/login",
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  // Company Onboarding Route
  {
    path: "/onboarding/company",
    element: (
      <AuthenticatedRoute>
        <CreateCompany />
      </AuthenticatedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      { path: "manage-employees", element: <ManageEmployees /> },
      { path: "add-employee", element: <AddEmployee /> },
      { path: "departments", element: <Departments /> },
    ],
  },
]);
