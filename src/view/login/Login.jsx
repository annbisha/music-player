import React, { useState } from "react";
import { useLoginMutation } from "../../services/apiSlice";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(null);
  const [loginMutation, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginMutation({ login, password }).unwrap();
      if (data.login === null) {
        setNotification({
          type: "error",
          message: "Invalid login or password.",
        });
      } else {
        localStorage.setItem("token", data);
        localStorage.setItem("login", login);
        setNotification({ type: "success", message: "Login successful!" });
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: `Error logging in`,
      });
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Login"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={isLoading}>
          Login
        </button>
      </form>
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Login;
