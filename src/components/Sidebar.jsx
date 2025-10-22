// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import Navbar from './Navbar';
import UserListItem from './UserListItem';

// 💡 Update: Accept the onUserSelect prop from Home.jsx
const Sidebar = ({ onUserSelect }) => { 
 const { currentUser } = useAuth();
 const { data, dispatch } = useChat();
 
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
  if (!currentUser) return;

  try {
   // Query to get all users *excluding* the current user
   const usersQuery = query(
    collection(db, 'users'),
    where('uid', '!=', currentUser.uid)
   );

   // Set up real-time listener
   const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
    const userList = snapshot.docs.map(doc => ({
     ...doc.data(),
     id: doc.id
    }));
    setUsers(userList);
    setLoading(false);
   }, (err) => {
    console.error("Error fetching users:", err);
    setError("Failed to load user list.");
    setLoading(false);
   });

   return () => unsubscribe(); // Cleanup listener
   
  } catch (e) {
   console.error("Initialization error:", e);
   setError("An unexpected error occurred.");
   setLoading(false);
  }
 }, [currentUser]);


 const handleSelectUser = (user) => {
  // 1. Dispatch the action to ChatContext to update the selected user and calculate chatId
  dispatch({ 
    type: 'CHANGE_USER', 
    payload: { 
      auth: { currentUser }, 
      user: user 
    } 
  });

    // 💡 Update: Call the handler to switch the view to the ChatBox on mobile screens
    if (onUserSelect) {
        onUserSelect();
    }
 };

 return (
  <>
   <Navbar />
   
   <div className="p-4 border-b">
    <input 
      type="text" 
      placeholder="Search users..." 
      className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
    />
   </div>

   <div className="flex-1 overflow-y-auto">
    {loading && <p className="p-4 text-center text-gray-500">Loading users...</p>}
    {error && <p className="p-4 text-center text-red-500">{error}</p>}
    
    {/* Map through the fetched users and render UserListItem */}
    {users.map((user) => (
     <UserListItem 
      key={user.uid}
      user={user}
      // 💡 Pass the updated handler which now triggers the mobile view switch
      onClick={() => handleSelectUser(user)} 
      // Check if this user is the currently selected chat user
      isSelected={data.user?.uid === user.uid} 
     />
    ))}

    {users.length === 0 && !loading && (
     <p className="p-4 text-center text-gray-500">No other users found.</p>
    )}
   </div>
  </>
 );
};

export default Sidebar;