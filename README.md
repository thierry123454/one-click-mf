# One-Click Meme Factory
## *Create Viral Meme Videos in Minutes!*

Turn today’s trends into absurd, shareable, short-form videos in minutes. One-Click Meme Factory pulls hype signals, composes a meme-ready prompt with an LLM, then renders a 5-second vertical clip via Runway (text→image→video). Perfect for creators, social teams, and scrappy startups that want to ride culture fast.

## ✨ What’s inside

- **Landing** (`/`) — flashy homepage with CTA  
- **Trend Picker** (`/story`) — fetches trending signals, lets you pick **entities**, **meme hooks**, and **style cues**, then generates a single-shot video prompt  
- **Generator** (`/generate`) — paste/auto-prefill the prompt, optionally upload up to 3 reference images, render **keyframe → 5s video** (9:16)

**APIs:**
- `POST /api/story` — uses OpenAI to synthesize a Runway-friendly video prompt  
- `GET /api/trends` — fetches YouTube “mostPopular” + LLM analysis (entities/hooks/styles)  
- `POST /api/generate` — Runway SDK pipeline: **text→image (gen4_image/_turbo)**, then **image→video (gen4_turbo)**

---

## 🚀 Quick Start

### 1) Clone & install
```bash
git clone https://github.com/thierry123454/one-click-mf.git
cd one-click-meme-factory
npm install
```

### 2) Environment variables
Setup Runway API Key in the project root:
```bash
export RUNWAYML_API_SECRET="key_123456789012345678901234567890"
```

Create .env.local in the project root:
```bash
# OpenAI (for prompt generation & trend analysis)
OPENAI_API_KEY=sk-********************************

# Runway (for image/video generation)
RUNWAY_API_KEY=key_****************************

# YouTube Data API v3 (for trending fetch)
YOUTUBE_API_KEY=AIzaSy********************************
```

### 3) Run dev server
```bash
npm run dev
# open http://localhost:3000
```

## 🧭 Usage
### Go to /story
- Pick a region (e.g., GB/US/IN) and Refresh
- Select up to 3 Entities, 1 Hook, 2 Style Cues
- (Optional) Add Subjects (e.g., “John Pork crashes a Warzone lobby”)
- Click Generate Video Prompt → Use in Generator
### Go to /generate
- Your prompt is prefilled (or paste your own)
- (Optional) Upload up to 3 reference images
- Click Generate → wait for keyframe and 5s vertical video
- Preview or Download

## 🧩 Dependencies
- next, react, react-dom, typescript
- tailwindcss, postcss, autoprefixer
-	@runwayml/sdk, openai

## 👤 Team
-	Solo builder: Thierry
