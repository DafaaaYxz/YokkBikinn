import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Bot, Message, ChatStatus } from '../types';
import { decodeBotFromUrl } from '../services/botStorage';
import { streamGeminiResponse } from '../services/geminiService';
import ChatBubble from '../components/ChatBubble';

const ChatPage: React.FC = () => {
  const { botId } = useParams(); // Not strictly needed if using query param sharing, but good for structure
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

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setStatus(ChatStatus.LOADING);

    // Placeholder for AI message
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
        messages, // Pass history (excluding current user message which is added locally)
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
          return { ...m, text: "⚠️ Connection error. Please try again." };
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

  if (!bot) return <div className="flex h-screen items-center justify-center">Loading Bot...</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#efe7dd] relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
      </div>

      {/* Header */}
      <header className="bg-wa-teal text-white p-2 px-4 flex items-center shadow-md z-10 shrink-0">
        <button onClick={() => navigate('/')} className="mr-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <img 
          src={bot.avatarUrl} 
          alt={bot.name} 
          className="w-10 h-10 rounded-full object-cover bg-gray-300 mr-3 border border-white/20" 
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/200'; }}
        />
        <div className="flex flex-col">
          <h1 className="font-semibold leading-tight">{bot.name}</h1>
          <span className="text-xs text-white/80">
            {status === ChatStatus.STREAMING || status === ChatStatus.LOADING ? 'typing...' : 'online'}
          </span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 z-10 scrollbar-hide relative">
        <div className="space-y-1">
          {/* System Notice */}
          <div className="flex justify-center mb-4">
            <span className="bg-[#FFF5C4] text-gray-800 text-xs px-3 py-1 rounded shadow-sm text-center max-w-[90%]">
              Messages are generated by AI. This chat is public if you share the link.
            </span>
          </div>
          
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-[#f0f2f5] p-2 flex items-center gap-2 z-10 shrink-0">
         <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 shadow-sm border border-gray-200">
           <input
             ref={inputRef}
             type="text"
             className="flex-1 outline-none text-gray-700 bg-transparent"
             placeholder="Type a message..."
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
           className={`p-3 rounded-full text-white shadow-md transition-all duration-200
             ${!inputValue.trim() ? 'bg-gray-400 cursor-default' : 'bg-wa-teal hover:bg-wa-header'}`}
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