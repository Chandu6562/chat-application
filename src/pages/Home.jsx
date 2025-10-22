// src/pages/Home.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import { useChat } from '../context/ChatContext'; 

const Home = () => {
  const { data } = useChat(); 
  
  // State to manage mobile view: 'sidebar' or 'chatbox'.
  const [mobileView, setMobileView] = useState('sidebar'); 
  
  const isChatSelected = data.chatId && data.chatId !== 'null';

  const handleOpenChat = () => {
    setMobileView('chatbox');
  };

  const handleCloseChat = () => {
    setMobileView('sidebar');
  };

    // Determine if we are on the mobile/tablet view showing the Sidebar (full screen)
    const showSidebarMobile = mobileView === 'sidebar';
    // Determine if we are on the mobile/tablet view showing the ChatBox (full screen)
    const showChatBoxMobile = mobileView === 'chatbox';


  return (
    <div className="flex w-screen h-screen">
      {/* Main container for the chat UI. It must flex its children. */}
      <div className="flex w-full h-full overflow-hidden bg-white">
        
        {/* ------------------------------------------- */}
        {/* 1. SIDEBAR (User List) */}
        {/* ------------------------------------------- */}
        <div 
          className={`
            flex flex-col h-full overflow-y-auto border-r bg-gray-50
            md:w-1/3 md:flex      /* Desktop: 1/3 width, always visible */
                        /* Mobile: If 'sidebar' view, take full width. Otherwise, hide. */
            ${showSidebarMobile ? 'w-full flex' : 'hidden'} 
          `}
        >
          <Sidebar onUserSelect={handleOpenChat} />
        </div>

        {/* ------------------------------------------- */}
        {/* 2. CHATBOX (Messages) / EMPTY STATE CONTAINER */}
        {/* ------------------------------------------- */}
        
        <div 
          className={`
            h-full 
            md:flex md:flex-1      /* Desktop: Takes remaining space, always visible */
                        /* Mobile: If 'chatbox' view, take full width. Otherwise, hide. */
            ${showChatBoxMobile ? 'w-full flex' : 'hidden'}
          `}
        >
                    {/* Conditional Rendering of ChatBox or Empty State */}
          {isChatSelected ? (
            <ChatBox 
              onBackToUsers={handleCloseChat} 
              isMobileView={showChatBoxMobile} 
            />
          ) : (
            /* EMPTY STATE MESSAGE */
            <div className="flex items-center justify-center flex-1 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black backdrop-blur-md">
              <p className="text-xl font-medium text-gray-400">
                                {/* Only show the text on desktop/tablet views where the Sidebar is also visible */}
                Select a user to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;