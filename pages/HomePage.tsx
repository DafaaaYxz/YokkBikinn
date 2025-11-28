import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from '../types';
import { getLocalBots, deleteLocalBot, encodeBotForUrl } from '../services/botStorage';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [bots, setBots] = useState<Bot[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setBots(getLocalBots());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm('Delete this bot?')) {
        deleteLocalBot(id);
        setBots(getLocalBots());
    }
  };

  const handleShare = (e: React.MouseEvent, bot: Bot) => {
    e.stopPropagation();
    const encoded = encodeBotForUrl(bot);
    const url = `${window.location.origin}/#/chat/share?data=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(bot.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleCardClick = (bot: Bot) => {
      const encoded = encodeBotForUrl(bot);
      navigate(`/chat/share?data=${encoded}`);
  }

  return (
    <div className="min-h-screen bg-wa-bg relative">
      <div className="bg-wa-teal h-32 absolute top-0 w-full z-0 shadow-sm"></div>
      
      <div className="relative z-10 container mx-auto px-4 pt-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8 text-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-wa-teal font-bold text-xl">
               AI
             </div>
             <h1 className="text-2xl font-bold">PersonaChat</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[60vh]">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h2 className="text-xl font-semibold text-gray-800">Your Bots</h2>
             <button 
               onClick={() => navigate('/create')}
               className="bg-wa-light hover:bg-green-500 text-white px-4 py-2 rounded-full font-medium shadow-sm transition flex items-center gap-2"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
               </svg>
               Create AI
             </button>
          </div>

          {/* List */}
          <div className="p-4">
            {bots.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="mb-4 text-lg">You haven't created any AI personas yet.</p>
                <button onClick={() => navigate('/create')} className="text-wa-teal hover:underline font-medium">Get started now</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bots.map((bot) => (
                  <div 
                    key={bot.id} 
                    onClick={() => handleCardClick(bot)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer flex items-center gap-4 bg-white group"
                  >
                    <img src={bot.avatarUrl} alt={bot.name} className="w-14 h-14 rounded-full object-cover bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{bot.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{bot.persona}</p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={(e) => handleShare(e, bot)}
                         className="p-2 text-gray-400 hover:text-wa-teal rounded-full hover:bg-gray-50 transition relative"
                         title="Copy Public Link"
                       >
                         {copiedId === bot.id ? (
                             <span className="text-xs absolute -top-4 right-0 bg-gray-800 text-white px-1 rounded">Copied!</span>
                         ) : null}
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                         </svg>
                       </button>
                       <button 
                         onClick={(e) => handleDelete(e, bot.id)}
                         className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition"
                         title="Delete"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                         </svg>
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;