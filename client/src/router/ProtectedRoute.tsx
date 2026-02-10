import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/authSlice";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, company, loading } = useAuth();
  console.log("ProtectedRoute: user =", user, "company =", company, "loading =", loading);
  const dispatch = useDispatch();

  if (loading) return <div>loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!company) return <Navigate to="/onboarding/company" />;

  dispatch(setUser(user));
  return <>{children}</>;
};

export const AuthenticatedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const dispatch = useDispatch();

  if (loading) return <div>loading...</div>;
  if (!user) return <Navigate to="/login" />;

  dispatch(setUser(user));
  return <>{children}</>;
};
export const GuestRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};
