import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy initializer for Google Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured in the developer's environment variables. Please configure it in Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for generating flashcards using Gemini v3.5-flash
app.post("/api/generate-cards", async (req, res) => {
  try {
    const { topic, notes, count = 10, currentCardsCount = 0 } = req.body;
    
    if (!topic && !notes) {
      return res.status(400).json({ error: "Please provide either a topic name or custom text notes/study material." });
    }

    const client = getGeminiClient();
    
    let userPrompt = "";
    if (notes) {
      userPrompt = `Please review the following study material and notes and generate exactly ${count} highly informational, clear, and distinct flashcards. Focus on key terminology, processes, formulas, or concepts.
      
Study Material Notes:
${notes}

Create a well-distributed range of cards covering the most essential aspects of the text.`;
    } else {
      userPrompt = `Generate exactly ${count} educational, accurate, and high-quality flashcards about the following topic: "${topic}".
      The target audience is curious learners/students. Include clear questions and concise but rich answers.`;
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: "You are a professional world-class educational designer, expert tutor, and quiz builder. Your task is to generate highly effective and accurate study flashcards based of user requests. Output MUST strictly match the specified JSON schema. Ensure questions are engaging and answers are precise and helpful.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of educational flashcards.",
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The term, question, or flashcard front text. Must be concise but fully structured."
              },
              answer: {
                type: Type.STRING,
                description: "The definition, explanation of term, or quiz answer. Front to back answer text."
              },
              explanation: {
                type: Type.STRING,
                description: "A brief, clear contextual hint, memory technique, or extra explanation about the term."
              },
              tag: {
                type: Type.STRING,
                description: "One single-word educational category or tag for this flashcard (e.g., Biology, Logic, Calculus, Capitals)."
              }
            },
            required: ["question", "answer"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty generation response received from Gemini.");
    }

    const cards = JSON.parse(text);
    return res.json({ cards });
  } catch (error: any) {
    console.error("Error generating flashcards via server Gemini API:", error);
    return res.status(500).json({ error: error.message || "An error occurred while communicating with the AI service. Please verify your API keys are configured." });
  }
});

// Vite server integrations
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started in ${process.env.NODE_ENV || "development"} mode.`);
    console.log(`AI Flashcard Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
