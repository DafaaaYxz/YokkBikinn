import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

// Safely retrieve API Key to prevent "process is not defined" errors in browser
const getApiKey = (): string => {
  try {
    // Check if process.env exists (Node.js/Bundled environment)
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error
  }
  // Fallback to the key provided by the user for this specific implementation
  return 'AIzaSyBywyuARVnFRcSMDerQJ2PZ_DZWHt5XaxA';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const streamGeminiResponse = async (
  history: Message[],
  persona: string,
  newMessage: string,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    // Map history to API format
    // Filter out empty messages and ensure role is valid
    const validHistory = history
      .filter(h => h.text.trim() !== '')
      .map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      }));

    // Use gemini-2.0-flash as requested
    const modelId = 'gemini-2.0-flash'; 

    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: persona, // This sets the "Persona"
        temperature: 0.7,
      },
      history: validHistory,
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    let fullText = '';
    
    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }

    return fullText;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
