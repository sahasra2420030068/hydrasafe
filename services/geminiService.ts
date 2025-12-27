
import { GoogleGenAI } from "@google/genai";

export const getSafetyGuidance = async (emergencyType: string, campus: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide 3 immediate, high-priority safety tips for a student experiencing a ${emergencyType} emergency at ${campus} campus in Hyderabad. Keep it short, authoritative, and helpful.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Safety Tips Error:", error);
    return "1. Stay in a well-lit area.\n2. Move towards the nearest Security Office.\n3. Keep your phone's volume low if in danger.";
  }
};

export const identifyLocationFromImage = async (base64Image: string, campus: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };
    const textPart = {
      text: `You are a campus security AI for ${campus}. Look at this photo taken by a student and identify where they are on campus. 
      List the landmark name and describe their approximate distance from the nearest security hub or safe zone. 
      Keep the response very concise (under 30 words).`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Visual Locate Error:", error);
    return "Unable to identify precise location. Please look for the nearest blue security pillar or landmark and use the standard SOS button.";
  }
};
