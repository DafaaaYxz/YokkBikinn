import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from '../types';
import { saveBotToLocal, encodeBotForUrl } from '../services/botStorage';

const CreateBotPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://picsum.photos/200');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !persona) return;

    setIsLoading(true);

    const newBot: Bot = {
      id: Date.now().toString(),
      name,
      persona,
      avatarUrl,
      createdAt: Date.now()
    };

    saveBotToLocal(newBot);

    // Generate Share URL
    const encoded = encodeBotForUrl(newBot);
    const shareUrl = `/chat/share?data=${encoded}`;

    // Simulate slight delay for effect
    setTimeout(() => {
      navigate(shareUrl);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-wa-bg p-4 flex justify-center items-start pt-10">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-wa-teal mb-6 text-center">Create New AI Persona</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-wa-light focus:border-transparent outline-none transition"
              placeholder="e.g., Anime Girl, Tech Support..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-wa-light focus:border-transparent outline-none transition"
              placeholder="https://..."
            />
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">Preview:</span>
              <img src={avatarUrl} alt="Preview" className="w-8 h-8 rounded-full bg-gray-200 object-cover" onError={(e) => (e.target as HTMLImageElement).src = 'https://picsum.photos/200'}/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Persona / System Instructions
              <span className="text-xs text-gray-400 font-normal ml-1">(Describe how the bot behaves)</span>
            </label>
            <textarea
              required
              rows={5}
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-wa-light focus:border-transparent outline-none transition resize-none"
              placeholder="Example: You are a tsundere anime character. You are rude at first but caring deep down. You end sentences with 'baka'."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-wa-teal text-white font-bold py-3 rounded-md hover:bg-wa-header transition shadow-md disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Bot & Chat'
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateBotPage;