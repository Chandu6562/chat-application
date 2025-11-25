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
      // The pathing to firebaseConfig and context files seems to be correct from the perspective of a component within 'src/components/'
      // It uses '../' to step up to 'src/' and then down into the target folders.

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

  // Updated handleSelectUser for cleaner context dispatch
  const handleSelectUser = (user) => {
    // Dispatch the selected user to the ChatContext
    dispatch({
      type: 'CHANGE_USER',
      payload: user, // Only send the user object
    });

    // Immediately call the prop to switch the mobile view (Fixes issue #1)
    if (onUserSelect) onUserSelect();
  };

  return (
    
    <div className="flex flex-col w-full h-full border-r bg-gray-50">
      
      {/* ✅ Navbar: Use flex-shrink-0 to ensure it keeps its size and doesn't scroll */}
      <div className="z-20 flex-shrink-0 bg-white shadow-sm">
        <Navbar />
      </div>

      {/* ✅ Search input area: Use flex-shrink-0 to keep it stable */}
      <div className="z-10 flex-shrink-0 p-4 bg-white border-b">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* ✅ Scrollable user list: Use flex-1 and overflow-y-auto */}
      <div className="flex-1 overflow-y-auto">
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