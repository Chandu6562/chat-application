// src/components/UserCard.jsx (Glassmorphism UI)
import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const UserCard = ({ user }) => {
 const { dispatch, data } = useChat();
 const { currentUser } = useAuth();
 const [lastMessageText, setLastMessageText] = useState("Tap to start conversation");

 // Placeholder for a real last message functionality
 useEffect(() => {
  // For Glassmorphism, let's make the default text a bit more subdued
 }, [data.chatId, user]);


 const handleSelect = () => {
  // Dispatch changes the user and chatId, triggering the ChatBox to update
  dispatch({ type: "CHANGE_USER", payload: user });
 };

 // Dynamic styling for active and hover states
 const cardClasses = data.user?.uid === user.uid
  ? "bg-indigo-200/60 border-l-4 border-indigo-600 shadow-inner" // Active state is a slightly opaque color
  : "hover:bg-white/70 transition duration-150 border-l-4 border-transparent hover:border-indigo-400"; // Hover uses higher opacity white

 // Use a default avatar if photoURL is missing
 const avatarUrl = user.photoURL || `https://placehold.co/50x50/8B5CF6/FFFFFF?text=${user.displayName[0]}`;


 return (
  <div 
   className={`flex items-center p-4 cursor-pointer transition duration-200 ease-in-out ${cardClasses}`}
   onClick={handleSelect}
  >
   <img 
    src={avatarUrl} 
    alt="Avatar" 
    className="object-cover w-12 h-12 mr-4 border-2 border-indigo-400 rounded-full shadow-md" 
   />
   <div className="flex-1 overflow-hidden">
    <h4 className="text-lg font-semibold text-gray-800 truncate">{user.displayName}</h4>
    <p className="text-sm italic text-gray-500 truncate">{lastMessageText}</p>
   </div>
  </div>
 );
};

export default UserCard;
