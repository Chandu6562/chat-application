// src/pages/Profile.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase/firebaseConfig';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [newAvatar, setNewAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(currentUser?.photoURL || '/default-avatar.png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(file);
      // Create a local URL for image preview
      setPreviewAvatar(URL.createObjectURL(file));
    } else {
      setNewAvatar(null);
      setPreviewAvatar(currentUser.photoURL || '/default-avatar.png');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let photoURL = currentUser.photoURL;

      // 1. Upload new avatar if selected
      if (newAvatar) {
        const storageRef = ref(storage, `avatars/${currentUser.uid}-${newAvatar.name}`);
        await uploadBytes(storageRef, newAvatar);
        photoURL = await getDownloadURL(storageRef);
      }

      // 2. Update user profile in Firebase Auth
      await updateProfile(currentUser, {
        displayName: displayName,
        photoURL: photoURL,
      });

      // 3. Update user document in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: displayName,
        photoURL: photoURL,
      });

      toast.success("Profile updated successfully!");
      setNewAvatar(null); // Clear the file input
      setLoading(false);
      navigate('/'); // Redirect to home or stay on profile
      
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Failed to update profile: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        <div className="flex items-center justify-between mb-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition">
                <ArrowLeft size={24} />
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">Your Profile</h2>
            <div></div> {/* Placeholder for alignment */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <img
              src={previewAvatar}
              alt="Profile Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-4 shadow-md"
            />
            <label htmlFor="avatar-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300">
              Change Avatar
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
            {newAvatar && <p className="text-sm text-gray-500 mt-2">{newAvatar.name}</p>}
          </div>

          {/* Display Name Input */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Display Name"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={currentUser.email}
              readOnly
              className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
          {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Profile;