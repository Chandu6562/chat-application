// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home'; // Main chat dashboard
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';
import './App.css';
import { useEffect } from 'react';

// Component to protect routes
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // If there's no user, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  // ✅ Fix for mobile browser 100vh issue (address bar height)
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    return () => window.removeEventListener('resize', setViewportHeight);
  }, []);

  return (
    // ✅ Use dynamic full height instead of h-screen
    <div className="w-screen overflow-hidden full-height">
      <BrowserRouter>
        <Routes>
          <Route path="/">
            {/* Protect the home (chat) route */}
            <Route
              index
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
