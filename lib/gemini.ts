// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// The ! tells TypeScript "I know this exists, trust me"
// In production you'd validate it exists first

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-pro",
  // gemini-1.5-flash = fast, free tier, perfect for JSON tasks
  // gemini-1.5-pro = smarter but slower, still free tier
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
