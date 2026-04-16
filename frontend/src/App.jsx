import React from "react";
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tutor from "./pages/Tutor.jsx";
import Profile from "./pages/Profile.jsx";
import useTutorStore from "./store/useTutorStore.js";

export default function App() {
useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const token = params.get("token");
  const student_id = params.get("student_id");
  const session_id = params.get("session_id");

  if (token) sessionStorage.setItem("token", token);
  if (student_id) sessionStorage.setItem("student_id", student_id);
  if (session_id) sessionStorage.setItem("session_id", session_id);
}, []);	
  const student_id = useTutorStore((s) => s.student_id);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={student_id ? <Profile /> : <Navigate to="/" replace />} />
      <Route
        path="/tutor"
        element={student_id ? <Tutor /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


