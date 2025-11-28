import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Function to format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex w-full mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[80%] px-3 py-2 rounded-lg shadow-sm text-sm md:text-base leading-snug
          ${isUser 
            ? 'bg-wa-outgoing text-gray-900 rounded-tr-none' 
            : 'bg-white text-gray-900 rounded-tl-none'
          }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.text}</div>
        <div className={`text-[10px] text-gray-500 mt-1 text-right`}>
          {formatTime(message.timestamp)}
          {isUser && <span className="ml-1 text-blue-400">✓✓</span>}
        </div>
        
        {/* Tail SVG */}
        <span className={`absolute top-0 ${isUser ? '-right-2 text-wa-outgoing' : '-left-2 text-white'}`}>
           <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="xMidYMid meet" version="1.1" x="0px" y="0px" enableBackground="new 0 0 8 13">
             <path opacity="0.13" fill="#00000000" d={isUser ? "M5.188,1H0v11.193l6.467-8.625C7.526,2.156,6.958,1,5.188,1z" : "M1.533,3.568L8,12.193V1H2.812C1.042,1,0.474,2.156,1.533,3.568z"}></path>
             <path fill="currentColor" d={isUser ? "M5.188,0H0v11.193l6.467-8.625C7.526,1.156,6.958,0,5.188,0z" : "M1.533,2.568L8,11.193V0H2.812C1.042,0,0.474,1.156,1.533,2.568z"}></path>
          </svg>
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;