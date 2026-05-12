# 🍳 FridgeHub

**Cook with what you already have.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r183-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=for-the-badge&logo=vercel)](https://fridgehub.vercel.app)

---

## 🌟 Overview

**FridgeHub** is a modern, full-stack web application designed to solve the "what's for dinner?" dilemma. By simply selecting the ingredients already in your kitchen, FridgeHub provides you with real-world recipes and creative AI-powered suggestions.

Built as a high-performance portfolio project, it demonstrates mastery in **Next.js 15 App Router**, **Three.js 3D rendering**, **AI Integration (Gemini & OpenAI)**, and **Modern React Patterns**.

🌐 **Live Demo:** [fridgehub.vercel.app](https://fridgehub.vercel.app)

---

## ✨ Key Features

### 🧊 Interactive 3D Fridge
A fully interactive fridge built with **Three.js** and **GSAP**.
*   **Dynamic Animations:** The door opens and closes as you interact with the ingredient picker.
*   **Visual Feedback:** Selected ingredients appear inside the fridge as colored 3D spheres.
*   **Sticker System:** Custom PNG stickers decorate the fridge door for a playful, modern aesthetic.

### 🥗 Smart Ingredient Picker
A category-based selection system (Protein, Vegetable, Dairy, Spice, Grain) that makes building your "basket" intuitive and fast.

### 🤖 AI Recipe Assistant
Powered by **Google Gemini 1.5 Flash** (with OpenAI fallback).
*   **Creative Suggestions:** Get unique recipes tailored exactly to your selected ingredients.
*   **Contextual Logic:** The AI explains *why* the ingredients work together.
*   **Structured Data:** Clean, fast, and structured JSON responses for a seamless UI experience.

### 📖 Real-World Recipes
Integration with **TheMealDB API** to provide:
*   Full ingredient lists and measurements.
*   Step-by-step cooking instructions.
*   YouTube video embeds for visual learners.

### ⚡ Premium UX
*   **Lottie Animations:** A smooth, custom pan-animation loading screen.
*   **Responsive Design:** Optimized for everything from mobile phones to ultra-wide monitors.
*   **Design Tokens:** A custom warm-themed design system built on Tailwind CSS v4.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server Components, Streaming, & Optimized Routing |
| **Language** | TypeScript | Type safety and developer productivity |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Utility-first styling with custom design tokens |
| **3D Engine** | Three.js + @gsap/react | High-performance 3D rendering and animations |
| **AI Models** | Google Gemini + OpenAI | Structured recipe generation and suggestions |
| **Deployment** | Vercel | Global Edge Network and CI/CD |

---

## 📂 Project Architecture

FridgeHub follows a strict **Separation of Concerns** principle:

```bash
app/
├── api/suggest/         # Gemini/OpenAI backend API routes
├── recipe/[id]/         # Dynamic recipe detail pages
├── recipes/             # Search results and filtering logic
└── page.tsx             # Home: 3D Fridge + Ingredient Grid
components/
├── Fridge.tsx           # Three.js Canvas & 3D Logic
├── IngredientGrid.tsx   # Tabbed ingredient selection UI
├── AIPanel.tsx          # AI Suggestion interface & animations
└── LoadingScreen.tsx    # Lottie-powered intro sequence
lib/
├── gemini.ts            # Google Generative AI configuration
├── mealdb.ts            # TheMealDB API transformation layer
└── ingredients.ts       # Central ingredient data & helpers
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   npm / pnpm / yarn
*   API Keys: `GEMINI_API_KEY` or `OPENAI_API_KEY`

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/kharalnirmal/RecipeHub.git
    cd RecipeHub
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root:
    ```env
    GEMINI_API_KEY=your_gemini_key_here
    OPENAI_API_KEY=your_openai_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` to see FridgeHub in action.

---

## 🧠 Core Concepts Learned

*   **Hybrid Rendering:** Balancing **Server Components** for data fetching and **Client Components** for heavy 3D interactivity.
*   **State Lifting:** Managing global ingredient state in `page.tsx` to synchronize the 3D Fridge and the UI Grid.
*   **Data Transformation:** Building a robust transformation layer in `lib/` to normalize raw API data into clean, typed internal schemas.
*   **3D Memory Management:** Properly disposing of Three.js geometries and textures to prevent memory leaks in a React environment.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Built with ❤️ by [Nirmal Kharal](https://github.com/kharalnirmal)
