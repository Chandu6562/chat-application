// src/components/ChatBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
 doc,
 onSnapshot,
 setDoc,
 arrayUnion,
 Timestamp,
 getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import Message from './Message';
import { toast } from 'react-toastify';
// 💡 Added ArrowLeft for the mobile back button
import { Send, Smile, X, ArrowLeft } from 'lucide-react'; 
import EmojiPicker from 'emoji-picker-react';

// 💡 Updated: Accept new props for mobile responsiveness
const ChatBox = ({ onBackToUsers, isMobileView }) => {
 const { data } = useChat();
 const { currentUser } = useAuth();
 const [messages, setMessages] = useState([]);
 const [text, setText] = useState('');
 const [showPicker, setShowPicker] = useState(false);
 const [editMessageId, setEditMessageId] = useState(null);
 const [replyMessage, setReplyMessage] = useState(null);
 const messagesEndRef = useRef(null);

 const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 const handleMarkAsRead = async (messageId) => {
  if (!data.chatId || !currentUser.uid) return;
  try {
   const chatDocRef = doc(db, 'chats', data.chatId);
   const chatDoc = await getDoc(chatDocRef);
   if (chatDoc.exists()) {
    const currentMessages = chatDoc.data().messages || [];
    const updatedMessages = currentMessages.map((msg) => {
     if (msg.id === messageId && msg.senderId === data.user.uid && !msg.isRead) {
      return { ...msg, isRead: true };
     }
     return msg;
    });
    await setDoc(chatDocRef, { messages: updatedMessages }, { merge: true });
   }
  } catch (err) {
   console.error('Error marking message as read:', err);
  }
 };

 useEffect(() => {
  if (data.chatId === 'null') {
   setMessages([]);
   return;
  }

  const unSub = onSnapshot(doc(db, 'chats', data.chatId), (docSnap) => {
   if (docSnap.exists()) {
    const messagesData = docSnap.data().messages || [];
    setMessages(messagesData);
    messagesData.forEach((msg) => {
     if (msg.senderId === data.user.uid && !msg.isRead) {
      handleMarkAsRead(msg.id);
     }
    });
   } else {
    setMessages([]);
   }
  });

  return () => unSub();
 }, [data.chatId, data.user.uid]);

 useEffect(() => {
  scrollToBottom();
 }, [messages]);

 const onEmojiClick = (emojiData) => {
  const emoji = emojiData?.emoji || emojiData?.native;
  if (emoji) setText((prevText) => prevText + emoji);
  setShowPicker(false);
 };

 const handleEditMessage = (messageId, currentText) => {
  setReplyMessage(null);
  setEditMessageId(messageId);
  setText(currentText);
  setShowPicker(false);
  toast.info('📝 Editing message. Type your changes and press Update.');
 };

 const handleUpdateMessage = async () => {
  if (!data.chatId || !editMessageId || !text.trim()) {
   toast.error('Cannot update with empty message.');
   return;
  }
  try {
   const chatDocRef = doc(db, 'chats', data.chatId);
   const chatDoc = await getDoc(chatDocRef);
   if (chatDoc.exists()) {
    const currentMessages = chatDoc.data().messages || [];
    const updatedMessages = currentMessages.map((msg) =>
     msg.id === editMessageId
      ? {
        ...msg,
        text: text.trim(),
        timestamp: Timestamp.now(),
        edited: true,
       }
      : msg
    );
    await setDoc(chatDocRef, { messages: updatedMessages }, { merge: true });
    setText('');
    setEditMessageId(null);
    toast.success('Message updated!');
   }
  } catch (err) {
   console.error('Error updating message:', err);
   toast.error('Failed to update message.');
  }
 };

 const handleCancelEdit = () => {
  setText('');
  setEditMessageId(null);
  toast.info('Editing cancelled.');
 };

 const handleReplyMessage = (message) => {
  setEditMessageId(null);
  setReplyMessage(message);
  setText('');
  setShowPicker(false);
 };

 const handleCancelReply = () => {
  setReplyMessage(null);
  setText('');
 };

 const handleDeleteMessage = async (messageId) => {
  if (!data.chatId) return;
  try {
   const chatDocRef = doc(db, 'chats', data.chatId);
   const chatDoc = await getDoc(chatDocRef);
   if (chatDoc.exists()) {
    const updatedMessages = (chatDoc.data().messages || []).filter(
     (msg) => msg.id !== messageId
    );
    await setDoc(chatDocRef, { messages: updatedMessages }, { merge: true });
    toast.success('Message deleted!');
   }
  } catch (err) {
   console.error('Error deleting message:', err);
   toast.error('Failed to delete message.');
  }
 };

 // ✅ Updated: Emoji Reaction Handler (Only one per user)
 const handleReactMessage = async (messageId, emoji) => {
  if (!data.chatId || !currentUser.uid) return;

  try {
   const chatDocRef = doc(db, 'chats', data.chatId);
   const chatDoc = await getDoc(chatDocRef);

   if (chatDoc.exists()) {
    const currentMessages = chatDoc.data().messages || [];

    const updatedMessages = currentMessages.map((msg) => {
     if (msg.id === messageId) {
      const reactions = msg.reactions || [];

      // Find user's existing reaction (if any)
      const userReaction = reactions.find((r) => r.userId === currentUser.uid);

      // Case 1: If user already reacted with the same emoji → remove it
      if (userReaction && userReaction.emoji === emoji) {
       return {
        ...msg,
        reactions: reactions.filter((r) => r.userId !== currentUser.uid),
       };
      }

      // Case 2: If user reacted with a different emoji → replace it
      const updatedReactions = [
       ...reactions.filter((r) => r.userId !== currentUser.uid),
       { userId: currentUser.uid, emoji },
      ];

      return { ...msg, reactions: updatedReactions };
     }
     return msg;
    });

    await setDoc(chatDocRef, { messages: updatedMessages }, { merge: true });
   }
  } catch (err) {
   console.error('Error reacting to message:', err);
  }
 };

 const handleSend = async (e) => {
  e.preventDefault();
  if (!data.chatId || !text.trim()) return;

  if (editMessageId) {
   await handleUpdateMessage();
   return;
  }

  try {
   const replyInfo = replyMessage
    ? {
      id: replyMessage.id,
      sender:
       replyMessage.senderId === currentUser.uid
        ? currentUser.displayName
        : data.user.displayName,
      text: replyMessage.text,
      senderId: replyMessage.senderId,
     }
    : null;

   const messageData = {
    id: crypto.randomUUID(),
    text: text.trim(),
    senderId: currentUser.uid,
    receiverId: data.user.uid,
    timestamp: Timestamp.now(),
    reactions: [],
    isRead: false,
    messageType: 'text',
    replyTo: replyInfo,
   };

   await setDoc(
    doc(db, 'chats', data.chatId),
    { messages: arrayUnion(messageData) },
    { merge: true }
   );

   setText('');
   setReplyMessage(null);
   toast.success('Message sent!', { autoClose: 1000 });
   setShowPicker(false);
  } catch (err) {
   console.error('Error sending message:', err);
   toast.error('Failed to send message.');
  }
 };

  // 💡 Check if no user is selected AND we are on a mobile view (to show the select user prompt correctly)
 if (data.chatId === 'null') {
  return (
   <div className="flex items-center justify-center flex-1 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black backdrop-blur-md">
        {/* Only show the back button if we were forced to this view on mobile */}
        {isMobileView && (
            <div className="absolute top-4 left-4 md:hidden">
                <button 
                    onClick={onBackToUsers} 
                    className="p-2 text-white transition rounded-full bg-gray-700/50 hover:bg-gray-700"
                    aria-label="Back to users"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>
        )}
        
    <p className="text-xl font-medium text-gray-400">
     👈 Select a user to start chatting
    </p>
   </div>
  );
 }

 return (
  <div className="relative flex flex-col flex-1 w-full h-full bg-gradient-to-br from-[#0f0f0f] via-[#121212] to-[#1a1a1a] text-gray-200 overflow-hidden rounded-1xl backdrop-blur-2xl shadow-2xl border border-gray-800/50">
   
      {/* Header */}
   <div className="z-10 flex items-center p-4 border-b border-gray-700 shadow-lg bg-white/10 backdrop-blur-xl">
        
        {/* 💡 MOBILE BACK BUTTON */}
        {isMobileView && (
            <button 
                onClick={onBackToUsers} 
                className="p-1 mr-2 text-gray-300 transition rounded-full md:hidden hover:bg-white/10"
                aria-label="Back to users"
            >
                <ArrowLeft size={24} />
            </button>
        )}
        
    <img
     src={
      data.user.photoURL ||
      'https://placehold.co/40x40/B3E5FC/039BE5?text=AV'
     }
     alt="Avatar"
     className="object-cover w-12 h-12 mr-4 border-2 border-blue-400 rounded-full"
    />
    <h3 className="text-xl font-semibold text-white">
     {data.user.displayName}
    </h3>
   </div>

   {/* Messages Area */}
   <div className="flex-1 w-full p-4 overflow-y-auto shadow-inner bg-white/5 backdrop-blur-lg chat-scrollbar">
    {messages.map((m) => (
     <Message
      key={m.id}
      message={m}
      onEdit={handleEditMessage}
      onReply={handleReplyMessage}
      onDelete={handleDeleteMessage}
      onReact={handleReactMessage}
      currentUserId={currentUser.uid}
     />
    ))}
    <div ref={messagesEndRef} />
   </div>

   {/* Emoji Picker */}
   {showPicker && (
    <div className="absolute z-20 overflow-hidden bottom-24 right-4 rounded-xl bg-[#1e1e1e]/70 backdrop-blur-2xl shadow-2xl border border-gray-700">
     <EmojiPicker onEmojiClick={onEmojiClick} height={350} />
    </div>
   )}

   {/* Input Section */}
   <form
    onSubmit={handleSend}
    className="flex flex-col p-4 border-t border-gray-700 shadow-lg bg-white/10 backdrop-blur-xl"
   >
    {(editMessageId || replyMessage) && (
     <div className="mb-2 transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-between p-3 text-sm border-l-4 border-blue-500 rounded-lg shadow-md bg-blue-500/10 backdrop-blur-md">
       {replyMessage ? (
        <div className="truncate">
         <p className="font-semibold text-blue-400">
          Replying to{' '}
          {replyMessage.senderId === currentUser.uid
           ? 'You'
           : data.user.displayName}
         </p>
         <p className="text-xs italic text-gray-300 truncate">
          {replyMessage.text}
         </p>
        </div>
       ) : (
        <p className="font-semibold text-blue-400">
         📝 Editing Message...
        </p>
       )}
       <button
        type="button"
        className="p-1 ml-3 text-blue-300 transition rounded-full hover:bg-blue-500/20"
        onClick={replyMessage ? handleCancelReply : handleCancelEdit}
        title={replyMessage ? 'Cancel Reply' : 'Cancel Edit'}
       >
        <X size={18} />
       </button>
      </div>
     </div>
    )}

    <div className="flex items-center space-x-3">
     {!(editMessageId || replyMessage) && (
      <Smile
       size={26}
       className="text-gray-400 transition transform cursor-pointer hover:text-yellow-400 hover:scale-110"
       onClick={() => setShowPicker(!showPicker)}
      />
     )}
     <input
      type="text"
      placeholder={
       editMessageId
        ? 'Edit message...'
        : replyMessage
        ? 'Reply to message...'
        : 'Type a message...'
      }
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="flex-1 px-5 py-3 text-gray-100 placeholder-gray-400 border border-gray-700 rounded-full bg-white/10 focus:ring-2 focus:ring-blue-500 focus:outline-none backdrop-blur-md"
      autoFocus={editMessageId || replyMessage}
     />
     <button
      type="submit"
      className="p-3 text-white transition transform bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!text.trim()}
     >
      {editMessageId ? 'Update' : <Send size={22} />}
     </button>
    </div>
   </form>
  </div>
 );
};

export default ChatBox;