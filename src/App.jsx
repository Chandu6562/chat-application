// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home'; // Main chat dashboard
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';
import './App.css'; 

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
 return (
    // ⬇️ ADDED FULL SCREEN TAILWIND CLASSES HERE ⬇️
    // h-screen (100vh) and w-screen (100vw) ensure the App fills the entire viewport.
  <div className="w-screen h-screen">
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