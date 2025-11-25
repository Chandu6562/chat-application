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

  // Open chat in mobile: UNCONDITIONAL FIX for issue #1 (Chat not opening on first click)
  // We switch the view immediately and rely on the ChatBox/context to render content correctly.
  const handleOpenChat = useCallback(() => {
    setMobileView('chatbox');
  }, []);

  // Go back to sidebar in mobile
  const handleCloseChat = useCallback(() => setMobileView('sidebar'), []);

  // ✅ Fix viewport height for real mobile devices (Maintaining existing logic)
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

  // ✅ FIX for issue #2: Browser History Management (Preventing navigation to Login)
  useEffect(() => {
    // Only execute this logic on mobile screen sizes when the chat is open
    if (showChatBoxMobile && isMobileScreen()) {
      
      // Push a state to history. This intercepts the device's back button.
      window.history.pushState({ mobileView: 'chatbox' }, '', window.location.pathname);

      const handlePopState = (event) => {
        // If the back button is pressed, intercept the action
        if (event.state && event.state.mobileView === 'chatbox') {
          handleCloseChat();
        } else {
          // Fallback: If navigating past our pushed state, prevent leaving the app
          window.history.pushState(null, '', window.location.pathname);
          handleCloseChat();
        }
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        
        // Clean up the history state when the component cleans up
        if (window.history.state && window.history.state.mobileView === 'chatbox') {
           // Use a timeout to ensure back button doesn't trigger another popstate event immediately
           setTimeout(() => window.history.back(), 0); 
        }
      };
    }
  }, [showChatBoxMobile, handleCloseChat]);


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
        {/* We pass handleOpenChat here, which now switches view unconditionally */}
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
            // onBackToUsers triggers handleCloseChat, switching the view internally (The arrow button)
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