'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prefill prompt if sent from Trend Picker
  useEffect(() => {
    const saved = localStorage.getItem('meme_video_prompt');
    if (saved) {
      setPrompt(saved);
      localStorage.removeItem('meme_video_prompt');
    }
  }, []);

  const onFiles = (list: FileList | null) => {
    setFiles(list ? Array.from(list).slice(0, 3) : []);
  };

  const generate = async () => {
    if (!prompt) return;
    setError(null); setLoading(true); setImageUrl(null); setVideoUrl(null);
    try {
      const fd = new FormData();
      fd.append('prompt', prompt);
      files.forEach(f => fd.append('images', f)); // up to 3
      const r = await fetch('/api/generate', { method: 'POST', body: fd });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setImageUrl(data.imageUrl || null);
      setVideoUrl(data.videoUrl || null);
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f14] text-white overflow-hidden">
      {/* BG glow blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[40rem] w-[40rem] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(ellipse at center, #00d4ff33, transparent 60%)' }} />
      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(ellipse at center, #7c3aed33, transparent 60%)' }} />

      <header className="relative z-10 border-b border-white/10 px-10 py-3">
        <h2 className="text-lg font-extrabold tracking-tight">
          Meme Factory — <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#7c3aed]">Generator</span>
        </h2>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto p-6 space-y-5">
        {/* Prompt card */}
        <section className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
          <h1 className="text-2xl font-bold">Meme Video Generator</h1>
          <p className="text-sm text-white/70 mt-1">Drop your story/prompt below (or use one from Trend Picker).</p>

          <input
            className="mt-3 w-full rounded-lg bg-[#11171d] h-12 p-3 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40 border border-white/10"
            placeholder="Put your meme story here!"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          {/* Dropzone */}
          <label className="mt-4 block">
            <span className="text-sm text-white/70">Upload up to 3 reference images (optional)</span>
            <div className="mt-2 rounded-xl border border-dashed border-white/20 bg-[#0f141a] p-4 hover:border-white/30 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                className="block w-full text-sm"
                onChange={(e) => onFiles(e.target.files)}
              />
              {files.length > 0 && (
                <div className="mt-2 text-xs text-white/60">
                  Selected: {files.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
          </label>

          <button
            onClick={generate}
            disabled={!prompt || loading}
            className="mt-4 w-full h-12 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#7c3aed] font-extrabold disabled:opacity-60 shadow-xl hover:scale-[1.01] transition"
          >
            {loading ? 'Generating… (image → video)' : 'Generate'}
          </button>

          {error && (
            <p className="mt-3 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm">
              {error}
            </p>
          )}
        </section>

        {/* Inline loading panel (appears just under the generator) */}
        {loading && (
          <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
              <div>
                <div className="font-bold">Cooking a meme…</div>
                <div className="text-sm text-white/70">text → image → video</div>
              </div>
              <div className="ml-auto flex items-center gap-2 text-2xl">
                <span className="animate-bob">😂</span>
                <span className="animate-bob-delayed">💥</span>
                <span className="animate-bob-slow">🎮</span>
              </div>
            </div>

            {/* Optional skeleton preview */}
            <div className="mt-4 aspect-[9/16] w-full rounded-lg bg-gradient-to-br from-white/10 to-white/5 animate-pulse" />
          </section>
        )}

        {/* Output cards */}
        {imageUrl && (
          <section className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
            <p className="text-sm text-white/70 text-center">Generated keyframe</p>
            <img src={imageUrl} alt="generated" className="mt-2 w-full rounded-lg bg-black" />
          </section>
        )}

        {videoUrl && (
          <section className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
            <p className="text-sm text-white/70 text-center">Animated clip</p>
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              playsInline
              muted
              className="mt-2 w-full rounded-lg bg-black"
            />
            <a href={videoUrl} download className="mt-2 underline block text-center text-white/80">Download</a>
          </section>
        )}
      </main>

      <style jsx global>{`
        @keyframes bob {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(3deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .animate-bob { animation: bob 1.6s ease-in-out infinite; }
        .animate-bob-delayed { animation: bob 1.8s ease-in-out 0.2s infinite; }
        .animate-bob-slow { animation: bob 2.1s ease-in-out 0.4s infinite; }
      `}</style>
    </div>
  );
}