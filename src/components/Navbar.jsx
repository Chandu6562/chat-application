// src/components/Navbar.jsx
import React from 'react';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      // 1. Update online status in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        isOnline: false,
      });
      // 2. Sign out from Firebase Auth
      await signOut(auth);
      toast.info("Logged out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out.");
    }
  };

  return (
    <div className="flex items-center justify-between p-4 text-white bg-blue-600 shadow-md">
      
      {/* App Logo/Title */}
      <Link to="/" className="text-xl font-bold">
        Talk2Me
      </Link>
      
      {/* User Info and Actions */}
      <div className="flex items-center space-x-5">
        
        <img
          src={currentUser.photoURL || '/default-avatar.png'}
          alt="Avatar"
          className="object-cover w-8 h-8 border-2 border-white rounded-full"
        />
        
        <span className="hidden text-sm font-medium sm:inline">{currentUser.displayName}</span>
        
        {/* Profile Link */}
        <Link to="/profile" title="View Profile" className="p-1 transition rounded-full hover:bg-blue-700">
            <User size={20} />
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-1 transition rounded-full hover:bg-red-500"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;