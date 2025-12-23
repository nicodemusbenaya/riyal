import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { RoomProvider } from "./contexts/RoomContext";
import { Toaster } from "./components/ui/sonner";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Room from "./pages/Room";
import OAuthCallback from "./pages/OAuthCallback";
import { MOCK_MODE } from "./services/api";

// Mock Mode Banner Component
const MockModeBanner = () => {
  if (!MOCK_MODE) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 backdrop-blur-sm">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <span>Mock Mode - UI Preview</span>
    </div>
  );
};

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-teal-50">
    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 animate-pulse">
      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">GroupMatch</h2>
    <p className="text-slate-400 text-sm mt-2">Memuat...</p>
  </div>
);

const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireProfile && !user.profileComplete) return <Navigate to="/profile-setup" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user && user.profileComplete) return <Navigate to="/dashboard" replace />;
  if (user && !user.profileComplete) return <Navigate to="/profile-setup" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* --- 2. TAMBAHKAN ROUTE INI --- */}
            {/* Route ini menangkap redirect dari Google/Backend */}
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/auth/google/callback" element={<OAuthCallback />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            {/* ------------------------------- */}

            {/* Profile Setup */}
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute requireProfile={false}>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room"
              element={
                <ProtectedRoute>
                  <Room />
                </ProtectedRoute>
              }
            />

            {/* Landing Page - redirect to dashboard if logged in */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <MockModeBanner />
      </RoomProvider>
    </AuthProvider>
  );
}

export default App;