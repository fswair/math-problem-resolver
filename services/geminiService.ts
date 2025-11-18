import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, ModelNames } from "../types";
import { SYSTEM_INSTRUCTION, THINKING_BUDGET } from "../constants";

// Initialize the client
// Note: API key must be provided via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a message to the Gemini model with history and optional image.
 */
export const sendMessageToGemini = async (
  history: Message[],
  currentText: string,
  currentImageBase64?: string
): Promise<string> => {
  try {
    // Convert internal Message format to GenAI Content format
    const historyContents: Content[] = history.map((msg) => {
      const parts: Part[] = [];
      
      if (msg.image) {
        // Extract base64 data (remove data:image/xyz;base64, prefix if present)
        const base64Data = msg.image.split(',')[1];
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg', // Assuming JPEG for simplicity, or detect from string
            data: base64Data,
          },
        });
      }
      
      if (msg.text) {
        parts.push({ text: msg.text });
      }

      return {
        role: msg.role,
        parts: parts,
      };
    });

    // Prepare the current message parts
    const currentParts: Part[] = [];
    if (currentImageBase64) {
      const base64Data = currentImageBase64.split(',')[1];
      currentParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      });
    }
    if (currentText) {
      currentParts.push({ text: currentText });
    }

    // We are using a stateless approach here for simplicity with images, 
    // passing the full history + new content each time.
    // This allows us to easily mix images into history at any point.
    
    const contents = [...historyContents, { role: 'user', parts: currentParts }];

    const response = await ai.models.generateContent({
      model: ModelNames.GEMINI_3_PRO_PREVIEW,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: {
            thinkingBudget: THINKING_BUDGET,
        },
        // Explicitly NOT setting maxOutputTokens as per requirement when using thinkingBudget
      },
    });

    if (response.text) {
      return response.text;
    } 
    
    return "I'm thinking... but I couldn't generate a text response. Please try again.";

  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw error;
  }
};
