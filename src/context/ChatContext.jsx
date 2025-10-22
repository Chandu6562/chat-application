// src/context/ChatContext.jsx
import { createContext, useContext, useReducer } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

// Initial state for the chat
const INITIAL_STATE = {
  chatId: "null",
  user: {}, // The user currently being chatted with
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE_USER':
      const { currentUser } = action.payload.auth;
      const selectedUser = action.payload.user;

      // Create a unique chat ID by sorting UIDs (ensures the ID is always the same)
      const combinedId =
        currentUser.uid > selectedUser.uid
          ? currentUser.uid + selectedUser.uid
          : selectedUser.uid + currentUser.uid;

      return {
        user: selectedUser,
        chatId: combinedId,
      };
    
    case 'RESET_CHAT':
        return INITIAL_STATE;

    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};