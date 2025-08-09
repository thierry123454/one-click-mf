'use client';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#111418] text-white">
      <header className="border-b border-[#283039] px-10 py-3">
        <h2 className="text-lg font-bold">Meme Factory</h2>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">One Click Meme Factory</h1>

        <input
          className="w-full rounded-lg bg-[#283039] h-12 p-3 placeholder:text-[#9caaba] focus:outline-none"
          placeholder='e.g., "Italian brainrot meme: Tung Tung vs Trallelero over John Pork"'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <label className="block">
          <span className="text-sm text-[#9caaba]">Upload up to 3 reference images (optional)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="mt-2 block w-full text-sm"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>

        <button
          onClick={generate}
          disabled={!prompt || loading}
          className="w-full h-12 rounded-lg bg-[#0d78f2] font-bold disabled:opacity-60"
        >
          {loading ? 'Generating… (image → video)' : 'Generate'}
        </button>

        {error && <p className="text-red-400 text-center">{error}</p>}

        {imageUrl && (
          <div className="space-y-2">
            <p className="text-sm text-[#9caaba] text-center">Generated keyframe</p>
            <img src={imageUrl} alt="generated" className="w-full rounded-lg bg-black" />
          </div>
        )}

        {videoUrl && (
          <div className="space-y-2">
            <p className="text-sm text-[#9caaba] text-center">Animated clip</p>
            <video src={videoUrl} controls loop playsInline muted className="w-full rounded-lg bg-black" />
            <a href={videoUrl} download className="underline block text-center text-[#9caaba]">Download</a>
          </div>
        )}
      </main>
    </div>
  );
}