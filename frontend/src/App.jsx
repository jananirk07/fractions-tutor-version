import React, { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tutor from "./pages/Tutor.jsx";
import Profile from "./pages/Profile.jsx";
import useTutorStore from "./store/useTutorStore.js";

function BootstrapAuth() {
  const navigate = useNavigate();
  const startExternalSession = useTutorStore((s) => s.startExternalSession);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const incomingStudentId = params.get("student_id");
    const incomingName = params.get("name");
    const sessionId = params.get("session_id");

    if (token) sessionStorage.setItem("token", token);
    if (sessionId) sessionStorage.setItem("session_id", sessionId);
    if (incomingStudentId) sessionStorage.setItem("student_id", incomingStudentId);

    async function boot() {
      if (!incomingStudentId) return;

      try {
        await startExternalSession({
          student_id: incomingStudentId,
          name: incomingName || "Student",
        });

        navigate("/tutor", { replace: true });
      } catch (e) {
        console.error("Portal bootstrap failed:", e);
      }
    }

    boot();
  }, [navigate, startExternalSession]);

  return null;
}

export default function App() {
  const student_id = useTutorStore((s) => s.student_id);

  return (
    <>
      <BootstrapAuth />

      <Routes>
        <Route
        path="/"
        element={student_id ? <Navigate to="/tutor" replace /> : <Home />}
        />
        <Route
          path="/dashboard"
          element={student_id ? <Dashboard /> : <Navigate to="/" replace />}
        />
        <Route
          path="/profile"
          element={student_id ? <Profile /> : <Navigate to="/" replace />}
        />
        <Route
          path="/tutor"
          element={student_id ? <Tutor /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}