import React from "react";
import { Navigate } from "react-router-dom";
import "./RequireAuth.css";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;
