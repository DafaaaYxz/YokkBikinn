import { Bot } from '../types';

const STORAGE_KEY = 'my_created_bots';

export const saveBotToLocal = (bot: Bot) => {
  const existingJson = localStorage.getItem(STORAGE_KEY);
  const bots: Bot[] = existingJson ? JSON.parse(existingJson) : [];
  bots.push(bot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bots));
};

export const getLocalBots = (): Bot[] => {
  const existingJson = localStorage.getItem(STORAGE_KEY);
  return existingJson ? JSON.parse(existingJson) : [];
};

export const deleteLocalBot = (id: string) => {
  const bots = getLocalBots();
  const newBots = bots.filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newBots));
};

// Encoding for Sharing (Base64)
// This makes the bot "Public" by embedding its definition in the URL
export const encodeBotForUrl = (bot: Bot): string => {
  // Minimize payload by only taking essential fields
  const payload = {
    n: bot.name,
    p: bot.persona,
    a: bot.avatarUrl,
    i: bot.id
  };
  const jsonStr = JSON.stringify(payload);
  return btoa(encodeURIComponent(jsonStr));
};

export const decodeBotFromUrl = (encoded: string): Bot | null => {
  try {
    const jsonStr = decodeURIComponent(atob(encoded));
    const payload = JSON.parse(jsonStr);
    return {
      id: payload.i || Date.now().toString(), // Fallback ID
      name: payload.n,
      persona: payload.p,
      avatarUrl: payload.a,
      createdAt: Date.now() // Treat as fresh session
    };
  } catch (e) {
    console.error("Failed to decode bot", e);
    return null;
  }
};