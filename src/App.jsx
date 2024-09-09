import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./view/home/Home";
import Playlists from "./view/playlists/Playlists";
import Login from "./view/login/Login";
import Register from "./view/register/Register";
import Player from "./components/player/Player";
import Header from "./components/header/Header";
import NotFound from "./components/notFound/NotFound";
import RequireAuth from "./components/requireAuth/RequireAuth";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/playlists"
              element={
                <RequireAuth>
                  <Playlists />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Player />
      </div>
    </Router>
  );
};

export default App;
