import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from '../types';
import { saveBotToLocal, encodeBotForUrl } from '../services/botStorage';

const CreateBotPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://ui-avatars.com/api/?name=Bot&background=random');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !persona) return;

    setIsLoading(true);

    const newBot: Bot = {
      id: Date.now().toString(),
      name,
      persona,
      avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${name}&background=random`,
      createdAt: Date.now()
    };

    saveBotToLocal(newBot);

    // Generate Share URL
    const encoded = encodeBotForUrl(newBot);
    // Use the exact share path format
    const shareUrl = `/chat/share?data=${encoded}`;

    // Simulate creation delay
    setTimeout(() => {
      navigate(shareUrl);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 flex justify-center items-start pt-10 font-sans">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-md overflow-hidden">
        <div className="bg-wa-teal p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Create AI Persona</h2>
            <p className="text-wa-outgoing text-sm">Create a bot, chat, and share with friends!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bot Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wa-light focus:border-transparent outline-none transition bg-gray-50"
              placeholder="e.g. Naruto, Tech Support, Helpful Assistant"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Persona Description</label>
             <p className="text-xs text-gray-500 mb-2">
               Describe how the AI should behave. You can be creative!
            </p>
            <textarea
              required
              rows={4}
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wa-light focus:border-transparent outline-none transition bg-gray-50 resize-none"
              placeholder="Example: You are a sarcastic robot who loves coffee. You answer questions with dry humor."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar Image URL (Optional)</label>
            <div className="flex gap-4 items-center">
                <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wa-light focus:border-transparent outline-none transition bg-gray-50"
                placeholder="https://example.com/image.png"
                />
                <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden shrink-0 bg-gray-100">
                    <img 
                        src={avatarUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        onError={(e) => (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=AI&background=random'}
                    />
                </div>
            </div>
          </div>

          <div className="pt-4">
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-wa-teal hover:bg-[#006e5a] text-white font-bold py-4 rounded-full transition shadow-lg disabled:opacity-70 flex justify-center items-center text-lg transform active:scale-98"
            >
                {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    <span>Creating Bot...</span>
                </div>
                ) : (
                'Create & Chat'
                )}
            </button>
          </div>
        </form>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-wa-teal font-medium">Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default CreateBotPage;
