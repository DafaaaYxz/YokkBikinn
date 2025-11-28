import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Message, ChatStatus } from '../types';
import { decodeBotFromUrl } from '../services/botStorage';
import { streamGeminiResponse } from '../services/geminiService';
import ChatBubble from '../components/ChatBubble';

const ChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bot, setBot] = useState<Bot | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<ChatStatus>(ChatStatus.IDLE);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Bot from URL Query Param
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const data = searchParams.get('data');
    if (data) {
      const decoded = decodeBotFromUrl(data);
      if (decoded) {
        setBot(decoded);
      } else {
        alert("Invalid Bot Link");
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !bot || status === ChatStatus.LOADING || status === ChatStatus.STREAMING) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    // Update UI immediately with user message
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setStatus(ChatStatus.LOADING);

    // Create placeholder for AI message
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsgPlaceholder: Message = {
      id: aiMsgId,
      role: 'model',
      text: '', // Start empty
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsgPlaceholder]);
    setStatus(ChatStatus.STREAMING);

    try {
      // Stream the response
      await streamGeminiResponse(
        messages, // Pass existing history
        bot.persona,
        userMsg.text,
        (chunk) => {
          setMessages(prev => prev.map(m => {
            if (m.id === aiMsgId) {
              return { ...m, text: m.text + chunk };
            }
            return m;
          }));
        }
      );
      setStatus(ChatStatus.IDLE);
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(m => {
        if (m.id === aiMsgId) {
          return { ...m, text: m.text || "⚠️ Connection error. Please try again." };
        }
        return m;
      }));
      setStatus(ChatStatus.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!bot) return <div className="flex h-screen items-center justify-center bg-[#e5ddd5]">Loading...</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#e5ddd5] relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0" 
           style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
      </div>

      {/* WhatsApp Header */}
      <header className="bg-wa-teal px-4 py-2 flex items-center shadow-sm z-10 shrink-0 text-white">
        <button onClick={() => navigate('/')} className="mr-2 p-1 rounded-full hover:bg-white/10 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        
        <div className="flex items-center flex-1 cursor-pointer">
          <img 
            src={bot.avatarUrl} 
            alt={bot.name} 
            className="w-10 h-10 rounded-full object-cover mr-3 border border-white/10"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=AI&background=random'; }}
          />
          <div className="flex flex-col justify-center">
            <h1 className="font-medium text-base leading-tight truncate max-w-[200px]">{bot.name}</h1>
            <span className="text-xs text-white/80 font-normal">
              {status === ChatStatus.STREAMING || status === ChatStatus.LOADING ? 'typing...' : 'online'}
            </span>
          </div>
        </div>

        <div className="flex gap-4 text-white/90">
           {/* Placeholder icons for WA look */}
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
             <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
           </svg>
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
             <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
           </svg>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 z-10 scrollbar-hide relative">
         {/* Date/Info Pill */}
         <div className="flex justify-center mb-6">
            <span className="bg-[#FFF5C4] text-gray-800 text-xs px-3 py-1.5 rounded-lg shadow-sm text-center max-w-[90%] border border-[#ffeeba]">
              Messages are generated by AI. Use this link to share the bot with friends!
            </span>
          </div>

        <div className="space-y-1 pb-2">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {messages.length === 0 && (
             <div className="text-center text-gray-500 text-sm mt-10 p-4 bg-white/50 rounded-lg mx-auto max-w-xs">
                Send a message to start chatting with {bot.name}!
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-[#f0f2f5] p-2 px-3 flex items-center gap-2 z-10 shrink-0 pb-safe">
         <button className="text-gray-500 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
               <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z" clipRule="evenodd" />
            </svg>
         </button>
         
         <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2 shadow-sm">
           <input
             ref={inputRef}
             type="text"
             className="flex-1 outline-none text-gray-700 bg-transparent text-base"
             placeholder="Type a message"
             value={inputValue}
             onChange={(e) => setInputValue(e.target.value)}
             onKeyDown={handleKeyDown}
             disabled={status === ChatStatus.LOADING || status === ChatStatus.STREAMING}
             autoFocus
           />
         </div>

         <button 
           onClick={handleSendMessage}
           disabled={!inputValue.trim() || status === ChatStatus.LOADING || status === ChatStatus.STREAMING}
           className={`p-3 rounded-full text-white shadow-md transition-transform duration-200 hover:scale-105 active:scale-95
             ${!inputValue.trim() ? 'bg-wa-teal opacity-50' : 'bg-wa-teal'}`}
         >
           {status === ChatStatus.LOADING || status === ChatStatus.STREAMING ? (
             <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
               <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
             </svg>
           )}
         </button>
      </footer>
    </div>
  );
};

export default ChatPage;
