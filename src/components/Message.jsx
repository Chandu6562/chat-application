// src/components/Message.jsx (Dark Glassmorphism UI)
import React, { useState, useRef } from 'react';
import { Trash2, MoreVertical, Check, CheckCheck, Edit, CornerUpLeft } from 'lucide-react';

// Helper component for menu items
const MenuItem = ({ icon: Icon, text, onClick, isDanger }) => (
  <button
    className={`flex items-center w-full px-3 py-1.5 rounded-md transition-all duration-200 
    hover:bg-white/10 hover:backdrop-blur-sm ${isDanger ? 'text-red-400 hover:text-red-300' : 'text-gray-200'}`}
    onClick={onClick}
  >
    <Icon size={14} className="mr-2" />
    {text}
  </button>
);

const Message = ({ message, onDelete, onReact, onEdit, onReply, currentUserId }) => {
  const [showHoverButton, setShowHoverButton] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const timeoutRef = useRef(null);

  const isOwner = message?.senderId === currentUserId;

  const messageClasses = isOwner ? 'flex justify-end' : 'flex justify-start';

  const bubbleClasses = isOwner
    ? 'bg-gradient-to-br from-cyan-600/50 to-cyan-800/40 text-white rounded-tl-xl rounded-b-xl backdrop-blur-md shadow-lg shadow-cyan-500/10'
    : 'bg-gray-800/40 text-gray-100 rounded-tr-xl rounded-b-xl backdrop-blur-md shadow-lg shadow-black/30 border border-white/10';

  const availableReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const groupedReactions = (message?.reactions || []).reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {});

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderReadStatus = () => {
    if (!isOwner) return null;
    return message?.isRead ? (
      <CheckCheck size={14} className="ml-1 text-cyan-300" />
    ) : (
      <Check size={14} className="ml-1 text-gray-500" />
    );
  };

  const handleActionClick = (callback, ...args) => {
    if (callback) callback(...args);
    setShowMenu(false);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowHoverButton(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowHoverButton(false);
    }, 200);
  };

  const renderReplyContent = () => {
    if (!message?.replyTo) return null;

    const isReplyToSelf = message.replyTo.senderId === currentUserId;
    const senderName = isReplyToSelf ? 'You' : message.replyTo.sender;
    const borderColor = isOwner ? 'border-cyan-400/60' : 'border-gray-500/50';
    const bgColor = isOwner ? 'bg-cyan-700/30' : 'bg-gray-700/30';
    const textColor = 'text-gray-200';
    const subTextColor = 'text-gray-400';

    return (
      <div className={`mb-2 p-2 rounded-md border-l-4 ${borderColor} ${bgColor} backdrop-blur-sm`}>
        <p className={`font-semibold text-xs ${textColor}`}>
          Replying to {senderName}
        </p>
        <p className={`text-xs truncate ${subTextColor}`}>
          {message.replyTo.text}
        </p>
      </div>
    );
  };

  return (
    <div className={`my-2 ${messageClasses}`}>
      <div
        className={`group relative max-w-xs md:max-w-md lg:max-w-lg p-3 transition-all duration-300 hover:scale-[1.02] ${bubbleClasses}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {renderReplyContent()}

        {message?.text && <p className="whitespace-pre-wrap">{message.text}</p>}

        {message?.edited && (
          <span
            className={`text-xs ml-1 italic ${
              isOwner ? 'text-cyan-200' : 'text-gray-400'
            }`}
          >
            (edited)
          </span>
        )}

        <span
          className={`text-xs flex items-center justify-end mt-1 ${
            isOwner ? 'text-cyan-200/80' : 'text-gray-400/80'
          }`}
        >
          {formatTime(message?.timestamp)}
          {renderReadStatus()}
        </span>

        {/* Hover Menu Button */}
        <div
          className={`absolute top-0 flex gap-1 transition duration-200 ${
            showHoverButton || showMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          style={{ [isOwner ? 'left' : 'right']: '-30px', top: '5px' }}
        >
          <button
            className="p-1 text-gray-300 transition rounded-full shadow-md bg-white/10 backdrop-blur-sm hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            title="Message Options"
          >
            <MoreVertical size={14} />
          </button>
        </div>

        {/* Context Menu */}
        {showMenu && (
          <div
            className="absolute z-30 py-1 text-sm text-gray-100 border rounded-lg shadow-xl bg-gray-900/80 border-white/10 backdrop-blur-md w-36"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              [isOwner ? 'right' : 'left']: '100%',
              marginLeft: isOwner ? '-10px' : '10px',
            }}
            onMouseLeave={() => setShowMenu(false)}
            tabIndex={0}
            onBlur={() => setShowMenu(false)}
          >
            {/* Reactions Row */}
            <div className="flex justify-around p-1 mb-1 border-b border-white/10">
              {availableReactions.map((emoji) => (
                <button
                  key={emoji}
                  className="text-xl p-0.5 rounded-full hover:bg-white/10 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick(onReact, message.id, emoji);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <MenuItem
              icon={CornerUpLeft}
              text="Reply"
              onClick={() => handleActionClick(onReply, message)}
            />
            {isOwner && (
              <>
                <MenuItem
                  icon={Edit}
                  text="Edit"
                  onClick={() => handleActionClick(onEdit, message.id, message.text)}
                />
                <MenuItem
                  icon={Trash2}
                  text="Delete"
                  onClick={() => handleActionClick(onDelete, message.id)}
                  isDanger
                />
              </>
            )}
          </div>
        )}

        {/* Reactions Display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div
            className="absolute p-0.5 bg-gray-900/70 border border-white/10 rounded-full shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition backdrop-blur-sm"
            style={{
              [isOwner ? 'right' : 'left']: '-8px',
              bottom: '-8px',
              zIndex: 1,
            }}
            onClick={() => setShowMenu(true)}
          >
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <span key={emoji} className="text-xs ml-0.5">
                {emoji}
                {count > 1 && (
                  <sub className="text-gray-400 font-medium ml-0.5">{count}</sub>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
