// src/components/UserListItem.jsx
import React from 'react';

const UserListItem = ({ user, onClick, isSelected }) => {
  return (
    <div
      onClick={() => onClick(user)}
      className={`flex items-center p-3 cursor-pointer transition border-b 
        ${isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-100'}`}
    >
      <div className="relative">
        <img
          src={user.photoURL || '/default-avatar.png'}
          alt="Avatar"
          className="object-cover w-12 h-12 mr-3 rounded-full"
        />
        {/* Online/Offline Status Indicator */}
        <span
          className={`absolute bottom-0 right-3 block w-3 h-3 rounded-full ring-2 ring-white 
            ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
        ></span>
      </div>

      <div>
        <p className="font-semibold text-gray-800">{user.displayName}</p>
        {/* Optional: Add last message preview or status text here */}
        <p className="text-sm text-gray-500 truncate">Tap to chat</p>
      </div>
    </div>
  );
};

export default UserListItem;