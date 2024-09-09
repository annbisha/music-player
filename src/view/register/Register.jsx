import React, { useState } from "react";
import { useRegisterMutation } from "../../services/apiSlice";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(null);
  const [registerMutation] = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await registerMutation({ login, password }).unwrap();

      if (result?.data.createUser === null) {
        setNotification({
          type: "error",
          message: "User already registered.",
        });
      } else {
        setNotification({
          type: "success",
          message: "Registration successful!",
        });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: `Error registering: ${err.message}`,
      });
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
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
        <button type="submit">Register</button>
      </form>
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Register;
