
import { GoogleGenAI, Type } from "@google/genai";
import { Quest, Language } from "../types";

// Initialize the Gemini AI client using the environment variable API_KEY directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const QUEST_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      difficulty: { type: Type.STRING },
      type: { type: Type.STRING },
      points: { type: Type.NUMBER },
      instructions: { type: Type.STRING },
      quizOptions: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
      },
      correctAnswer: { type: Type.STRING },
    },
    required: ["id", "title", "description", "difficulty", "type", "points", "instructions"],
  },
};

export async function generateDailyQuests(lang: Language): Promise<Quest[]> {
  // Fix: Removed 'es' and 'fr' as they are not defined in the Language type.
  const langNames: Record<Language, string> = { en: 'English', sr: 'Serbian' };
  const prompt = `Generate 4 creative 'Side Quests' for a mobile app. 
  LANGUAGE: ${langNames[lang]}.
  
  TYPES TO MIX: QUIZ, IMAGE, TEXT, LOCATION, ONLINE_IMAGE.
  RULES:
  - DO NOT make all 4 the same. Max 2 of any specific type.
  - For ONLINE_IMAGE: Instructions must ask user to find a specific image on the internet (e.g. "Find a meme of a cat in a hat", "Find a picture of a 1920s car").
  - For QUIZ: Provide EXACTLY 3 funny and relevant options.
  - For LOCATION: Instructions must specify a type of real-world public place (e.g. "Go to a library", "Find a fountain").
  - STYLE: Edgy, modern, funny. No boring trivia.
  
  Return JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUEST_SCHEMA,
      },
    });

    const rawQuests = JSON.parse(response.text || "[]");
    return rawQuests.map((q: any) => ({ 
      ...q, 
      id: q.id || Math.random().toString(36).substr(2, 9),
      createdAt: Date.now() 
    }));
  } catch (e) {
    console.error("Quest generation failed:", e);
    return [];
  }
}

export async function verifyQuestWithAI(
  quest: Quest, 
  proof: string, 
  type: 'IMAGE' | 'TEXT' | 'LOCATION' | 'ONLINE_IMAGE',
  lang: Language
): Promise<{ success: boolean; feedback: string }> {
  const model = 'gemini-3-flash-preview';
  // Fix: Removed 'es' and 'fr' as they are not defined in the Language type.
  const langNames: Record<Language, string> = { en: 'English', sr: 'Serbian' };
  
  const typeRules = {
    TEXT: "This is strictly a TEXT submission. Judge creativity and relevance.",
    IMAGE: "This is strictly an IMAGE submission. Analyze visual data.",
    ONLINE_IMAGE: "This is strictly an ONLINE IMAGE search task. The user found this image online.",
    LOCATION: `This is strictly a LOCATION submission via coordinates. Check if these coordinates [${proof}] correspond to: '${quest.instructions}'.`
  };

  const instructions = `You are a strict, sassy AI Quest Master. 
  QUEST TITLE: "${quest.title}"
  QUEST DESC: "${quest.description}"
  EXPECTED TYPE: ${type}
  
  VERIFICATION CONTEXT:
  ${typeRules[type]}
  
  USER LANGUAGE: ${langNames[lang]}
  YOUR FEEDBACK LANGUAGE: You MUST respond in ${langNames[lang]}.
  
  IF FAIL: success=false, feedback="[Roast the user for a poor attempt in ${langNames[lang]}]"
  IF PASS: success=true, feedback="[Brief funny praise in ${langNames[lang]}]"
  
  Return JSON: { "success": boolean, "feedback": "string" }`;

  const parts: any[] = [{ text: instructions }];

  if (type === 'IMAGE' || type === 'ONLINE_IMAGE') {
    parts.push({ 
      inlineData: { 
        mimeType: 'image/jpeg', 
        data: proof.includes('base64,') ? proof.split('base64,')[1] : proof 
      } 
    });
  } else {
    parts.push({ text: `User Proof Data: "${proof}"` });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
          },
          required: ["success", "feedback"]
        }
      }
    });

    return JSON.parse(response.text || '{"success":false, "feedback":"System Error"}');
  } catch (e) {
    console.error("Verification failed:", e);
    return { success: false, feedback: "AI judging failed. Try again!" };
  }
}
