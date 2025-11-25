import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import { useChat } from '../context/ChatContext';

const Home = () => {
  const { data } = useChat();

  // Mobile view: 'sidebar' or 'chatbox'
  const [mobileView, setMobileView] = useState('sidebar');
  const isChatSelected = data.chatId && data.chatId !== 'null';

  // Open chat in mobile
  const handleOpenChat = () => {
    if (isChatSelected) setMobileView('chatbox');
  };

  // Go back to sidebar in mobile
  const handleCloseChat = () => setMobileView('sidebar');

  // ✅ Fix viewport height for real mobile devices (Landed here correctly)
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
  // Use data.chatId as the definitive check for showing the chat on mobile, 
  // as the `mobileView` state only controls the *visibility*
  const showChatBoxMobile = mobileView === 'chatbox'; 

  return (
    // Outer container: Must use 'full-height' to fix mobile viewport issues
    <div className="flex overflow-hidden bg-white full-height"> 
      
      {/* SIDEBAR */}
      <div
        className={`
          flex flex-col border-r bg-gray-50 full-height
          transition-all duration-300 ease-in-out
          
          /* Desktop: Show sidebar, set its width */
          md:flex md:w-[300px] md:max-w-[30%]
          
          /* Mobile: Conditional display */
          ${showSidebarMobile ? 'w-full flex' : 'hidden'}
        `}
      >
        {/* Overflow-y-auto is best applied to the content inside the sidebar, not the container itself */}
        <Sidebar onUserSelect={handleOpenChat} />
      </div>

      {/* CHATBOX */}
      <div
        className={`
          flex flex-col full-height
          transition-all duration-300 ease-in-out
          
          /* Desktop: Always show, take up remaining space */
          md:flex md:flex-1 
          
          /* Mobile: Conditional display */
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
  );
};

export default Home;