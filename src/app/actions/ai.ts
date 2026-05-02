"use server";
import { AI_MODELS } from "@/lib/ai-config";
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { StructuredTutorial, ExamRoutineItem } from "@/lib/types";

// This file runs exclusively on the server, keeping API keys private.
const SYSTEM_INSTRUCTION = `You are "BOU CSE Study Pilot", an Expert Academic Counselor for Bangladesh Open University BSc in CSE students. 
Rules:
1. Total credits: 148, Scale: 4.00.
2. If the user mentions a Course Code, identify if it is Theory or Practical. Refer to the BOU marking distribution (Theory: 30% CA, 70% Final; Practical: 40% CA, 60% Final).
3. Languages: Use English or Bengali. Keep technical CSE terms in English.
4. Tone: Encouraging, Structured, and Exam-Oriented.
5. Search Grounding: Use for BOU news, exam dates, or location searches for Regional Centers.
6. Assist with Viva preparation by asking conceptual questions for lab courses.
7. Resource Finder Logic: Use STRICT_FREE_ONLY filter. Prioritize high-retention English YouTube channels (Neso Academy, Gate Smashers, FreeCodeCamp) and MIT OCW/LibreTexts for Physics.
`;

import { getAvailableGeminiKey } from "@/lib/env";

// Fallback logic
async function withRetry<T>(operation: (ai: GoogleGenAI) => Promise<T>, userApiKey?: string): Promise<T> {
  // If user passed a key directly via function args, use it. Otherwise, use the load balancer which checks cookies then env.
  const resolvedKey = userApiKey || await getAvailableGeminiKey();

  if (!resolvedKey) {
    throw new Error("No Gemini API key available. Please configure one in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey: resolvedKey });
  return await operation(ai);
}

// ==========================================
// COUNSELOR CHAT (ChatBot.tsx)
// ==========================================

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

export async function counselorChatAction(
  message: string,
  mode: 'general' | 'exam' | 'planning' | 'tma',
  context: string,
  history: ChatHistoryItem[],
  userApiKey?: string
): Promise<{ text: string; groundingUrls: string[] }> {
  return await withRetry(async (ai) => {
    let modeInstruction = SYSTEM_INSTRUCTION;
    switch (mode) {
      case 'exam':
        modeInstruction += "\nFOCUS: Exam Preparation. Analyze previous questions, focus on marking schemes, and suggest revision priorities.";
        break;
      case 'planning':
        modeInstruction += "\nFOCUS: Degree Planning. Advise on prerequisites, course sequences, and CGPA improvement strategies.";
        break;
      case 'tma':
        modeInstruction += "\nFOCUS: TMA Analysis. Help structure assignment answers, interpret prompts, and ensure academic integrity.";
        break;
    }

    if (context) {
      modeInstruction += `\n\nSTUDENT CONTEXT: ${context}`;
    }

    const chat = ai.chats.create({
      model: AI_MODELS.DEFAULT_OPS,
      config: {
        systemInstruction: modeInstruction,
        tools: [{ googleSearch: {} }],
      },
      history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))
    });

    const response = await chat.sendMessage({ message });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingUrls: string[] = chunks
      ?.map((c: {web?: {uri?: string}}) => c.web?.uri as string)
      ?.filter(Boolean) || [];

    return { text: response.text || '', groundingUrls };
  }, userApiKey);
}

// ==========================================
// VIVA SIMULATOR (VivaSimulator.tsx)
// ==========================================

export async function vivaStartAction(
  courseName: string,
  courseId: string,
  topics: string[],
  userApiKey?: string
): Promise<string> {
  return await withRetry(async (ai) => {
    const chat = ai.chats.create({
      model: AI_MODELS.DEFAULT_OPS,
      config: {
        systemInstruction: "You are an external examiner for a Computer Science Viva Voce. Ask deep conceptual questions. Be professional, strict but fair.",
      }
    });

    const openMsg = `START VIVA SESSION for "${courseName}" (${courseId}).${topics.length > 0 ? ` Key Topics: ${topics.join(', ')}` : ''} Ask your first question now.`;
    const response = await chat.sendMessage({ message: openMsg });
    return response.text || 'Please tell me about this course.';
  }, userApiKey);
}

export async function vivaChatAction(
  message: string,
  history: ChatHistoryItem[],
  userApiKey?: string
): Promise<string> {
  return await withRetry(async (ai) => {
    const chat = ai.chats.create({
      model: AI_MODELS.DEFAULT_OPS,
      config: {
        systemInstruction: "You are an external examiner for a Computer Science Viva Voce. Ask deep conceptual questions. Be professional, strict but fair.",
      },
      history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))
    });

    const response = await chat.sendMessage({ message });
    return response.text || '';
  }, userApiKey);
}

export async function generateSpeechAction(text: string, userApiKey?: string): Promise<string | undefined> {
  return await withRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ parts: [{ text: `Ask this viva question clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }, userApiKey);
}

// ==========================================
// SYLLABUS EXPLORER (SyllabusExplorer.tsx)
// ==========================================

export async function explainTopicAction(courseName: string, topic: string, userApiKey?: string): Promise<string> {
  return await withRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: AI_MODELS.DEFAULT_OPS,
      contents: `Explain the concept "${topic}" from the course "${courseName}" in 3 simple sentences. Focus on the 'Why' and 'How'.`,
    });
    return response.text || 'Explanation unavailable.';
  }, userApiKey);
}

export async function generateQuizAction(courseName: string, topic: string, userApiKey?: string): Promise<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
} | null> {
  return await withRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: AI_MODELS.DEFAULT_OPS,
      contents: `Create a single multiple-choice question for "${topic}" (${courseName}). Return JSON: { "question": string, "options": string[], "correctAnswer": number (0-3), "explanation": string }`,
      config: { responseMimeType: "application/json" }
    });
    try {
      return JSON.parse(response.text || '{}');
    } catch {
      return null;
    }
  }, userApiKey);
}

// ==========================================
// ROUTINE ANALYZER (RoutineAnalyzer.tsx)
// ==========================================

export async function extractRoutineAction(
  base64Image: string,
  mimeType: string,
  userApiKey?: string
): Promise<ExamRoutineItem[]> {
  return await withRetry(async (ai) => {
    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING, description: "Course Code like CSE-1201" },
          date: { type: Type.STRING, description: "Date in DD/MM/YYYY or readable format" },
          time: { type: Type.STRING, description: "Time of exam" }
        },
        required: ["code", "date"]
      }
    };

    const response = await ai.models.generateContent({
      model: AI_MODELS.DEFAULT_OPS,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: "Extract the exam routine from this image. Identify Course Codes, Dates, and Times. Ignore non-exam text." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    try {
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Failed to parse routine JSON", e);
      return [];
    }
  }, userApiKey);
}

// ==========================================
// RESOURCE FINDER (ResourceFinder.tsx)
// ==========================================

export async function generateCheatSheetAction(
  courseName: string,
  unitTitle: string,
  topics: string[],
  focusAreas: string[],
  format: string,
  depth: string,
  userApiKey?: string,
  tweakPrompt?: string,
  previousData?: unknown
): Promise<unknown> {
  return await withRetry(async (ai) => {
    let prompt = `Act as an expert instructor for the Bangladesh Open University (BOU).
COURSE: "${courseName}"
UNIT: "${unitTitle}"
TOPICS TO COVER: ${topics.join(', ')}
STUDENT FOCUS AREAS: ${focusAreas.join(', ')}
DESIRED FORMAT STYLE: "${format}"
DEPTH LEVEL: "${depth}"

TASK: Generate a highly structured, 1-page "Cheat Sheet" for this specific unit. 
CONSTRAINTS:
1. Focus entirely on the core concepts needed for BOU final exams.
2. Adapt the content style to the DESIRED FORMAT STYLE (e.g. if 'Flashcard Style', structure concepts as Q&A pairs).
3. Adapt the detail level based on the DEPTH LEVEL.
4. You must strictly output JSON matching the required schema. If there are no relevant formulas for this topic (e.g., History), return an empty array [] for formulas.`;

    if (tweakPrompt && previousData) {
      prompt += `

USER TWEAK REQUEST: "${tweakPrompt}"
PREVIOUS GENERATION DATA: ${JSON.stringify(previousData)}

Please completely regenerate the JSON based on the tweak request.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: AI_MODELS.DEFAULT_OPS,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              coreConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
              formulas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    equation: { type: Type.STRING }
                  },
                  required: ["name", "equation"]
                }
              },
              proTips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "coreConcepts", "formulas", "proTips"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to generate cheat sheet", e);
      throw new Error("Failed to generate cheat sheet.");
    }
  }, userApiKey);
}

export async function generateTMAOutlineAction(courseName: string, unitTitle: string, userPrompt: string, userApiKey?: string): Promise<string> {
  return await withRetry(async (ai) => {
    const prompt = `Act as a strict academic tutor for Bangladesh Open University (BOU).
COURSE: "${courseName}"
CONTEXT UNIT: "${unitTitle}"
STUDENT TMA PROMPT / QUESTION: "${userPrompt}"

TASK: Generate a structured outline to help the student write their Tutor Marked Assignment (TMA) for this question. Do NOT write the entire essay for them.
CONSTRAINTS:
1. Provide a step-by-step structure (Introduction, Core Arguments/Code, Analysis, Conclusion).
2. For each step, provide 2-3 bullet points of what the student needs to discuss.
3. Suggest specific BOU textbook definitions or diagrams they should reference.
4. Warn them of common pitfalls or plagiarism traps for this specific topic.
5. Format strictly in markdown.`;

    try {
      const response = await ai.models.generateContent({
        model: AI_MODELS.DEFAULT_OPS,
        contents: prompt,
      });
      return response.text || "TMA Outline generation failed.";
    } catch (e) {
      console.error("Failed to generate TMA outline", e);
      throw new Error("Failed to generate TMA outline.");
    }
  }, userApiKey);
}

export async function findStructuredTutorialsAction(
  courseName: string,
  unitTitle: string,
  topics: string[],
  preference: string,
  userApiKey?: string
): Promise<StructuredTutorial[]> {
  return await withRetry(async (ai) => {
    const prompt = `Act as an expert academic advisor for University students.
COURSE: "${courseName}"
UNIT: "${unitTitle}"
TOPICS TO MASTER: ${topics.join(', ')}
STUDENT PREFERENCE: ${preference}

TASK: Find the absolute best 3 online resources (tutorials, videos, or articles) that perfectly explain these topics according to the student's preference.
Focus on highly reputable channels (e.g., Neso Academy, Gate Smashers, Anisul Islam, FreeCodeCamp), top-tier domains (GeeksforGeeks, NPTEL, Coursera, edX, MIT OpenCourseWare), or any other high-quality educational platform.

CRITICAL INSTRUCTION: You must provide actual, valid, live URLs for these resources. Do NOT hallucinate URLs or provide dead links. Search for real links from YouTube, GFG, MIT OCW, NPTEL, Coursera, etc. Respond ONLY with the requested JSON structure. Include both a direct 'url' and a fallback 'searchQuery'.`;

    try {
      const response = await ai.models.generateContent({
        model: AI_MODELS.DEFAULT_OPS,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, description: "video, article, or interactive" },
                provider: { type: Type.STRING, description: "YouTube, GFG, Coursera, etc." },
                reason: { type: Type.STRING, description: "Why it fits their preference" },
                language: { type: Type.STRING, description: "Bangla, English, etc." },
                searchQuery: { type: Type.STRING, description: "A fallback search string" },
                url: { type: Type.STRING, description: "A VALID, working direct URL to the resource. You must verify this exists." }
              },
              required: ["title", "type", "provider", "reason", "language", "searchQuery", "url"]
            }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Failed to recommend resources", e);
      throw new Error("Failed to recommend resources.");
    }
  }, userApiKey);
}

// ==========================================
// FLASHCARD FORGE (FlashcardForge.tsx)
// ==========================================

export async function generateFlashcardsAction(
  courseName: string,
  courseId: string,
  topics: string[],
  userApiKey?: string
): Promise<{ question: string, answer: string }[]> {
  return await withRetry(async (ai) => {
    const prompt = `Generate 5 high-yield study flashcards for the course "${courseName}" (${courseId}).
      Topics to focus on: ${topics.join(', ')}. 
      Format: JSON array of objects with { "question": string, "answer": string }. 
      Keep questions concise and answers explanatory.`;

    try {
      const response = await ai.models.generateContent({
        model: AI_MODELS.DEFAULT_OPS,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Failed to generate flashcards", e);
      throw new Error("Failed to generate flashcards.");
    }
  }, userApiKey);
}

// ==========================================
// COURSE WORKSPACE TUTOR (CourseWorkspace.tsx)
// ==========================================

export async function courseTutorChatAction(
  courseName: string,
  courseId: string,
  courseOverview: string,
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  userApiKey?: string
): Promise<string> {
  return await withRetry(async (ai) => {
    const chat = ai.chats.create({
      model: AI_MODELS.DEFAULT_OPS,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\nYou are currently tutoring a student on "${courseName}" (${courseId}). ${courseOverview}`,
      },
      history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))
    });

    const response = await chat.sendMessage({ message });
    return response.text || 'I am sorry, something went wrong.';
  }, userApiKey);
}
