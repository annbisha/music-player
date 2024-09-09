import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { resetPlayer } from "../../store/reducers/playerReducer";
import { stopTrack } from "../../store/thunks/playerThunks";
import "./Header.css";
import { useDispatch } from "react-redux";

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("login");
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("login");

    dispatch({ type: "RESET_STORE" });
    dispatch(resetPlayer());
    dispatch(stopTrack());

    navigate("/login");
  };

  return (
    <header className="header">
      <h1>Musik</h1>
      <nav className="nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-button active" : "nav-button"
          }
        >
          Songs
        </NavLink>
        <NavLink
          to="/playlists"
          className={({ isActive }) =>
            isActive ? "nav-button active" : "nav-button"
          }
        >
          Playlists
        </NavLink>
        {!token && (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "nav-button active" : "nav-button"
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? "nav-button active" : "nav-button"
              }
            >
              Register
            </NavLink>
          </>
        )}
        {token && (
          <>
            <span className="user-info">Logged in as: {userName}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
