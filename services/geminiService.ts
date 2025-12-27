import { GoogleGenAI, SchemaType } from "@google/generative-ai";
import { Quest, Language } from "../types";

// U Vite-u koristimo import.meta.env umesto process.env
const apiKey = import.meta.env.VITE_gemini_api_key;

// Inicijalizacija klijenta na ispravan način
const genAI = new GoogleGenAI(apiKey || "");

// Koristimo SchemaType iz nove biblioteke
const QUEST_SCHEMA = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      id: { type: SchemaType.STRING },
      title: { type: SchemaType.STRING },
      description: { type: SchemaType.STRING },
      difficulty: { type: SchemaType.STRING },
      type: { type: SchemaType.STRING },
      points: { type: SchemaType.NUMBER },
      instructions: { type: SchemaType.STRING },
      quizOptions: { 
        type: SchemaType.ARRAY, 
        items: { type: SchemaType.STRING },
      },
      correctAnswer: { type: SchemaType.STRING },
    },
    required: ["id", "title", "description", "difficulty", "type", "points", "instructions"],
  },
};

export async function generateDailyQuests(lang: Language): Promise<Quest[]> {
  const langNames: Record<Language, string> = { en: 'English', sr: 'Serbian' };
  
  const prompt = `Generate 4 creative 'Side Quests' for a mobile app. 
  LANGUAGE: ${langNames[lang]}.
  
  TYPES TO MIX: QUIZ, IMAGE, TEXT, LOCATION, ONLINE_IMAGE.
  RULES:
  - DO NOT make all 4 the same. Max 2 of any specific type.
  - For ONLINE_IMAGE: Instructions must ask user to find a specific image on the internet (e.g. "Find a meme of a cat in a hat").
  - For QUIZ: Provide EXACTLY 3 funny and relevant options.
  - For LOCATION: Instructions must specify a type of real-world public place.
  - STYLE: Edgy, modern, funny. No boring trivia.
  
  Return JSON only.`;

  try {
    // Koristimo stabilan model gemini-1.5-flash
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: QUEST_SCHEMA,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const rawQuests = JSON.parse(text || "[]");
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
  const langNames: Record<Language, string> = { en: 'English', sr: 'Serbian' };
  
  const typeRules = {
    TEXT: "This is strictly a TEXT submission. Judge creativity and relevance.",
    IMAGE: "This is strictly an IMAGE submission. Analyze visual data.",
    ONLINE_IMAGE: "This is strictly an ONLINE IMAGE search task.",
    LOCATION: `This is strictly a LOCATION submission via coordinates [${proof}].`
  };

  const instructions = `You are a strict, sassy AI Quest Master. 
  QUEST TITLE: "${quest.title}"
  QUEST DESC: "${quest.description}"
  EXPECTED TYPE: ${type}
  VERIFICATION CONTEXT: ${typeRules[type]}
  USER LANGUAGE: ${langNames[lang]}
  YOUR FEEDBACK LANGUAGE: Respond in ${langNames[lang]}.
  
  IF FAIL: success=false, feedback="[Roast the user]"
  IF PASS: success=true, feedback="[Funny praise]"
  
  Return JSON: { "success": boolean, "feedback": "string" }`;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          success: { type: SchemaType.BOOLEAN },
          feedback: { type: SchemaType.STRING },
        },
        required: ["success", "feedback"]
      },
    },
  });

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
    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const response = await result.response;
    return JSON.parse(response.text() || '{"success":false, "feedback":"System Error"}');
  } catch (e) {
    console.error("Verification failed:", e);
    return { success: false, feedback: "AI judging failed. Try again!" };
  }
}