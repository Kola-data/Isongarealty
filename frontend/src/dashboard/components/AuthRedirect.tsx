import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/UserStore";

interface AuthRedirectProps {
  children: ReactNode;
}

export const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
