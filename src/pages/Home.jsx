// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import { useChat } from '../context/ChatContext';

const Home = () => {
  const { data } = useChat();

  // State to manage mobile view: 'sidebar' or 'chatbox'
  const [mobileView, setMobileView] = useState('sidebar');

  const isChatSelected = data.chatId && data.chatId !== 'null';

  const handleOpenChat = () => {
    setMobileView('chatbox');
  };

  const handleCloseChat = () => {
    setMobileView('sidebar');
  };

  // ✅ Fix viewport height for real mobile devices (Safari/Chrome)
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    return () => window.removeEventListener('resize', setViewportHeight);
  }, []);

  // Determine mobile/tablet view
  const showSidebarMobile = mobileView === 'sidebar';
  const showChatBoxMobile = mobileView === 'chatbox';

  return (
    // ✅ Use CSS variable --vh for full viewport height on real mobile devices
    <div
      className="flex w-screen overflow-hidden bg-white"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <div className="flex w-full h-full overflow-hidden bg-white">
        
        {/* ------------------------------------------- */}
        {/* 1. SIDEBAR (User List) */}
        {/* ------------------------------------------- */}
        <div
          className={`
            flex flex-col overflow-y-auto border-r bg-gray-50
            transition-all duration-300 ease-in-out
            md:w-1/3 md:flex 
            ${showSidebarMobile ? 'w-full flex' : 'hidden'}
          `}
        >
          <Sidebar onUserSelect={handleOpenChat} />
        </div>

        {/* ------------------------------------------- */}
        {/* 2. CHATBOX (Messages) / EMPTY STATE */}
        {/* ------------------------------------------- */}
        <div
          className={`
            flex h-full
            transition-all duration-300 ease-in-out
            md:flex md:flex-1
            ${showChatBoxMobile ? 'w-full flex' : 'hidden'}
          `}
        >
          {isChatSelected ? (
            <ChatBox 
              onBackToUsers={handleCloseChat} 
              isMobileView={showChatBoxMobile} 
            />
          ) : (
            <div className="flex items-center justify-center flex-1 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black backdrop-blur-md">
              <p className="px-4 text-xl font-medium text-center text-gray-400">
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
