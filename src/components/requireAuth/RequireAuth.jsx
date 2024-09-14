import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./RequireAuth.css";

const RequireAuth = ({ children }) => {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;
