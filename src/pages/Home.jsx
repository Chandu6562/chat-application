import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import { useChat } from '../context/ChatContext';

const Home = () => {
  const { data } = useChat();

  // Mobile view: 'sidebar' or 'chatbox'
  const [mobileView, setMobileView] = useState('sidebar');
  const isChatSelected = data.chatId && data.chatId !== 'null';
  
  // Responsive check for history management
  const isMobileScreen = () => window.innerWidth < 768;

  // Open chat in mobile
  const handleOpenChat = useCallback(() => {
    setMobileView('chatbox');
  }, []);

  // Go back to sidebar in mobile
  const handleCloseChat = useCallback(() => setMobileView('sidebar'), []);

  // ✅ FIX: Calculate and set custom viewport height (--vh) for robust mobile layout
  useEffect(() => {
    const setViewportHeight = () => {
      // Use window.innerHeight (the visual height, which shrinks with the keyboard)
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    // Set initial height and update on resize (keyboard open/close)
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    // Also monitor viewport change if available (for better mobile support)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', setViewportHeight);
    }
    
    return () => {
        window.removeEventListener('resize', setViewportHeight);
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', setViewportHeight);
        }
    };
  }, []);

  const showSidebarMobile = mobileView === 'sidebar';
  const showChatBoxMobile = mobileView === 'chatbox'; 

  // ✅ History Management (Fixing back navigation)
  useEffect(() => {
    // Only execute this logic on mobile screen sizes when the chat is open
    if (showChatBoxMobile && isMobileScreen()) {
      
      window.history.pushState({ mobileView: 'chatbox' }, '', window.location.pathname);

      const handlePopState = (event) => {
        if (event.state && event.state.mobileView === 'chatbox') {
          handleCloseChat();
        } else {
          window.history.pushState(null, '', window.location.pathname);
          handleCloseChat();
        }
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        
        if (window.history.state && window.history.state.mobileView === 'chatbox') {
           setTimeout(() => window.history.back(), 0); 
        }
      };
    }
  }, [showChatBoxMobile, handleCloseChat]);


  return (
    // Outer container: 
    // ✅ FIX: Explicitly set height using the custom CSS property to ensure it respects 
    // the dynamic viewport height (preventing header from being pushed off-screen).
    <div 
      className="flex overflow-hidden bg-white" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }} 
    > 
      
      {/* SIDEBAR */}
      <div
        className={`
          flex flex-col border-r bg-gray-50
          transition-all duration-300 ease-in-out
          
          /* Desktop: Show sidebar, set its width */
          md:flex md:w-[300px] md:max-w-[30%]
          
          /* Mobile: Conditional display */
          ${showSidebarMobile ? 'w-full flex h-full' : 'hidden'}
        `}
        // Apply height to sidebar too for consistency
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }} 
      >
        <Sidebar onUserSelect={handleOpenChat} />
      </div>

      {/* CHATBOX */}
      <div
        className={`
          flex flex-col
          transition-all duration-300 ease-in-out
          
          /* Desktop: Always show, take up remaining space */
          md:flex md:flex-1 
          
          /* Mobile: Conditional display */
          ${showChatBoxMobile ? 'w-full flex h-full' : 'hidden'}
        `}
        // Apply height to chatbox container too for consistency
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }} 
      >
        {isChatSelected ? (
          <ChatBox
            onBackToUsers={handleCloseChat}
            isMobileView={showChatBoxMobile}
          />
        ) : (
          <div className="flex items-center justify-center flex-1 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black">
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