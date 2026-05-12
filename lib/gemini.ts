// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// The ! tells TypeScript "I know this exists, trust me"
// In production you'd validate it exists first

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.4,
    topP: 0.9,
  },
  // gemini-1.5-flash is fast and stable for structured JSON responses.
  // Lower temperature keeps output more deterministic and consistent.
});

export default genAI;

// ─────────────────────────────────────────────────────────────
// REMEMBER FOR FUTURE PROJECTS:
// Any third-party service (Stripe, Resend, AWS, etc.)
// follows this same pattern:
//   1. Install their SDK
//   2. Create instance in lib/servicename.ts with env var key
//   3. Export the instance
//   4. Import in your API routes
