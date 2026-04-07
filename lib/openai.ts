import OpenAI from "openai";

//creating one instance

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

// ─────────────────────────────────────────────────────────────
// REMEMBER FOR FUTURE PROJECTS:
// Any third-party service (Stripe, Resend, AWS, etc.)
// follows this same pattern:
//   1. Install their SDK
//   2. Create instance in lib/servicename.ts with env var key
//   3. Export the instance
//   4. Import in your API routes
