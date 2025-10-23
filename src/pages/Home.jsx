import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import { useChat } from '../context/ChatContext';

const Home = () => {
  const { data } = useChat();

  const [mobileView, setMobileView] = useState('sidebar');
  const isChatSelected = data.chatId && data.chatId !== 'null';

  const handleOpenChat = () => setMobileView('chatbox');
  const handleCloseChat = () => setMobileView('sidebar');

  // ✅ Fix viewport height for real mobile devices
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    return () => window.removeEventListener('resize', setViewportHeight);
  }, []);

  const showSidebarMobile = mobileView === 'sidebar';
  const showChatBoxMobile = mobileView === 'chatbox';

  return (
    <div className="flex w-screen overflow-hidden bg-white full-height">
      <div className="flex w-full h-full overflow-hidden bg-white">
        
        {/* SIDEBAR */}
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

        {/* CHATBOX */}
        <div
          className={`
            flex flex-col h-full
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
            <div className="flex items-center justify-center flex-1 w-full full-height bg-gradient-to-br from-gray-900 via-gray-800 to-black">
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
