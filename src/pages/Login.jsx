// src/pages/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      // 1. Sign in the user
      const res = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Update online status in Firestore
      await updateDoc(doc(db, 'users', res.user.uid), {
        isOnline: true,
      });

      toast.success("Login successful!");
      navigate('/');
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account? <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;