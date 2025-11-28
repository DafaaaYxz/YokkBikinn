import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

const apiKey = process.env.API_KEY || ''; // In production, this comes from env

const ai = new GoogleGenAI({ apiKey });

export const streamGeminiResponse = async (
  history: Message[],
  persona: string,
  newMessage: string,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    // We map our Message type to the API's Content format
    // Filter out empty messages to prevent API errors
    const validHistory = history.filter(h => h.text.trim() !== '');

    // We use gemini-2.0-flash as requested by user (or fallback to latest flash)
    const modelId = 'gemini-2.0-flash'; 

    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: persona,
        temperature: 0.7,
      },
      history: validHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
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