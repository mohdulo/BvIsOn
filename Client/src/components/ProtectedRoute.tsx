import React, { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { RouteKey, canAccess } from "../permissions";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  /** même valeur que dans PERMISSIONS */
  routeKey: RouteKey;
  children: JSX.Element;
}

const ProtectedRoute: React.FC<Props> = ({ routeKey, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!canAccess(user.country, routeKey)) {
    // ↳ redirection vers le Dashboard
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
};

export default ProtectedRoute;
