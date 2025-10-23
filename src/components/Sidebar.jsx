// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import Navbar from './Navbar';
import UserListItem from './UserListItem';

const Sidebar = ({ onUserSelect }) => { 
  const { currentUser } = useAuth();
  const { data, dispatch } = useChat();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('uid', '!=', currentUser.uid)
      );

      const unsubscribe = onSnapshot(
        usersQuery,
        (snapshot) => {
          const userList = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setUsers(userList);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching users:', err);
          setError('Failed to load user list.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error('Initialization error:', e);
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  }, [currentUser]);

  const handleSelectUser = (user) => {
    dispatch({
      type: 'CHANGE_USER',
      payload: { auth: { currentUser }, user },
    });

    if (onUserSelect) onUserSelect();
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-gray-50 border-r md:w-auto md:flex">
      {/* ✅ Navbar always visible, fixed height */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <Navbar />
      </div>

      {/* ✅ Search input area */}
      <div className="p-4 border-b bg-white sticky top-[60px] z-10">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* ✅ Scrollable user list */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading && (
          <p className="p-4 text-center text-gray-500">Loading users...</p>
        )}
        {error && <p className="p-4 text-center text-red-500">{error}</p>}

        {users.map((user) => (
          <UserListItem
            key={user.uid}
            user={user}
            onClick={() => handleSelectUser(user)}
            isSelected={data.user?.uid === user.uid}
          />
        ))}

        {users.length === 0 && !loading && (
          <p className="p-4 text-center text-gray-500">No other users found.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
