import { createContext, useContext, useReducer } from 'react';
import { useAuth } from './AuthContext'; // Keeping the standard path, as it is structurally correct

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
      // FIX: Access selected user from action.payload and current user UID from the injected action property
      const selectedUser = action.payload;
      const currentUserUid = action.currentUserUid; 

      // Guard clause: ensure both UIDs exist before calculating ID
      if (!currentUserUid || !selectedUser.uid) {
        return state;
      }

      // Create a unique chat ID by sorting UIDs (ensures the ID is always the same)
      const combinedId =
        currentUserUid > selectedUser.uid
          ? currentUserUid + selectedUser.uid
          : selectedUser.uid + currentUserUid;

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

  // FIX: Wrap the dispatch function to inject currentUserUid into the action
  const dispatchWithCurrentUser = (action) => {
    if (action.type === 'CHANGE_USER' && currentUser) {
      // Inject the current user's UID directly into the action for the reducer
      dispatch({ ...action, currentUserUid: currentUser.uid });
    } else {
      dispatch(action);
    }
  };

  return (
    // Provide the wrapped dispatch function
    <ChatContext.Provider value={{ data: state, dispatch: dispatchWithCurrentUser }}>
      {children}
    </ChatContext.Provider>
  );
};