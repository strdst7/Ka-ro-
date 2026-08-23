# Ka!ro — Proactive AI Co-Creator

An intelligent, proactive prompt refinement and creative co-creation workspace powered by Google Gemini 2.5. **Ka!ro** collaborates with writers, designers, and creators to transform raw concepts into rich, structured prompts and vivid story drafts through interactive clarification cycles.

---

## ✨ Features

- 💡 **Interactive Clarification Engine**
  - Analyzes raw creative ideas and surfaces smart, targeted clarification questions.
  - Interactive options with multi-choice chips and custom user input to refine narrative tone, character depth, and setting details.
  - Dynamic thinking process indicator showing real-time analysis steps.

- 📝 **Dual-Output Refinement & Generation**
  - **Refined Master Prompt**: Optimized for AI image generation, story crafting, or game worldbuilding.
  - **Narrative Story Draft**: Fully fleshed-out story segment incorporating all clarification choices.
  - Side-by-side / vertical stream comparison with version diffs and history tracking.

- 🌐 **Full Multilanguage Support (English & Bahasa Melayu)**
  - Seamless, instant switching between English and Bahasa Melayu.
  - Localized UI controls, tooltips, category labels, thinking step animations, and prompt bank presets.
  - Gemini prompt generation dynamically adapts to the active language.

- 📚 **Curated Prompt Bank**
  - Ready-to-use creative starters spanning Sci-Fi, Fantasy, Cyberpunk, Slice of Life, and Horror.
  - Fully bilingual templates in both English and Bahasa Melayu.

- 📱 **Mobile-Optimized Experience**
  - One-tap quick-switch Floating Action Button (FAB) on mobile viewports to toggle between Editor and Preview modes.
  - Touch-friendly controls with responsive drawer navigation and haptic-feel animations.

- 🎨 **Ambient Fluid Visual Canvas**
  - GPU-accelerated responsive fluid mesh background responding subtly to theme and interactions.
  - Dark and Light mode themes with smooth transitions.

- 💾 **Export, Sharing & Session Management**
  - **Export to Image (PNG)**: Snapshot high-resolution styled output cards using `html-to-image`.
  - **JSON Export / Import**: Save and restore complete creative sessions.
  - **Version History**: Local session persistence to revisit, compare, and fork earlier drafts.
  - **Fine-Tuning Controls**: Adjust Gemini temperature, response creativity, and model parameters.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **AI Model**: [Google GenAI SDK (`@google/genai`)](https://github.com/google-gemini/generative-ai-js) — Gemini 2.5 Flash
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Motion (`motion/react`)](https://motion.dev/)
- **Image Generation / Export**: [`html-to-image`](https://github.com/bubkoo/html-to-image)

---

## 📁 Project Structure

```text
├── components/
│   ├── ClarificationCard.tsx   # Interactive question-and-answer clarification UI
│   ├── FluidBackground.tsx     # Canvas-based ambient particle mesh
│   ├── Header.tsx              # Main navigation, language switcher & theme toggle
│   ├── HistorySidebar.tsx      # Past sessions and prompt iteration logs
│   ├── OutputDisplay.tsx       # Refined prompt & story output viewer
│   ├── OutputGallery.tsx       # Grid gallery of generated artifacts
│   ├── PromptInput.tsx         # Primary prompt editor & parameter drawer
│   ├── Skeleton.tsx            # Loading skeletons and shimmer states
│   ├── Tooltip.tsx             # Accessible UI tooltips
│   ├── WelcomeOverlay.tsx      # Onboarding introduction modal
│   └── icons.tsx               # Custom SVG icon components
├── data/
│   └── promptBank.ts           # Bilingual creative starter templates
├── services/
│   ├── geminiService.ts        # Gemini API integration & structured schema calls
│   ├── i18n.ts                 # Internationalization strings (EN & BM)
│   └── sessionService.ts       # LocalStorage session & history management
├── types.ts                    # TypeScript data models and interfaces
├── App.tsx                     # Core application state & layout coordinator
├── index.html                  # HTML entry point
└── vite.config.ts              # Vite configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn** / **pnpm**
- **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/proactive-co-creator.git
cd proactive-co-creator
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add your Gemini API key:

```env
API_KEY=your_gemini_api_key_here
```

*(Alternatively, the app supports `GEMINI_API_KEY` or `VITE_GEMINI_API_KEY`)*

### 4. Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) to view the application.

### 5. Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### 6. Linting

Verify TypeScript types and code quality:

```bash
npm run lint
```

---

## 📜 License

MIT License © 2026

---

> *rationalize my instinct over intellect -> miii | [aimirah.com](https://aimirah.com) | 2026 | nur amirah mohd kamil*
