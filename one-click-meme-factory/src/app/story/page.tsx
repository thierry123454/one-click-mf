'use client';
import { useEffect, useState } from 'react';

type TrendingItem = {
  position?: number;
  id: string;
  title: string;
  link?: string;
  views?: number;
  thumbnail?: string;
  channel?: { title?: string };
};

type PromptResp = { video_prompt: string };

export default function StoryBuilder() {
  const [raw, setRaw] = useState<string>(() =>
    JSON.stringify(
      {
        recently_trending: [
          {
            position: 1,
            id: 'xy8aJw1vYHo',
            title: 'Joker: Folie à Deux | Official Teaser Trailer',
            link: 'https://www.youtube.com/watch?v=xy8aJw1vYHo',
            views: 30533260,
            channel: { title: 'Warner Bros. Pictures' },
            length: '2:25',
            published_time: '7 days ago',
            thumbnail: 'https://i.ytimg.com/vi/xy8aJw1vYHo/hqdefault.jpg'
          }
        ]
      },
      null,
      2
    )
  );

  const [items, setItems] = useState<TrendingItem[]>([]);
  const [selected, setSelected] = useState<TrendingItem | null>(null);
  const [subjects, setSubjects] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const parseInput = () => {
    setError(null);
    setVideoPrompt('');
    try {
      const obj = JSON.parse(raw);
      const arr = Array.isArray(obj?.recently_trending) ? obj.recently_trending : [];
      if (!arr.length) throw new Error('No items in recently_trending.');
      const mapped: TrendingItem[] = arr.map((it: any) => ({
        position: it.position,
        id: String(it.id),
        title: String(it.title),
        link: it.link,
        views: it.views,
        thumbnail: it.thumbnail,
        channel: { title: it?.channel?.title }
      }));
      setItems(mapped);
      setSelected(mapped[0]);
    } catch (e: any) {
      setItems([]);
      setSelected(null);
      setError(e?.message || 'Invalid JSON.');
    }
  };

  const generatePrompt = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    setVideoPrompt('');
    try {
      const r = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: selected, subjects })
      });
      if (!r.ok) throw new Error(await r.text());
      const data = (await r.json()) as PromptResp;
      setVideoPrompt(data.video_prompt || '');
    } catch (e: any) {
      setError(e?.message || 'Failed to generate prompt.');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!videoPrompt) return;
    await navigator.clipboard.writeText(videoPrompt);
    alert('Copied!');
  };

  const useInGenerator = () => {
    if (!videoPrompt) return;
    localStorage.setItem('meme_video_prompt', videoPrompt);
    window.location.href = '/'; // go to generator page
  };

  return (
    <div className="min-h-screen bg-[#111418] text-white">
      <header className="border-b border-[#283039] px-6 py-3">
        <h2 className="text-lg font-bold">Meme Factory — Story Lab</h2>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <section className="space-y-3">
          <h3 className="text-xl font-semibold">1) Paste YouTube Trending JSON</h3>
          <textarea
            className="w-full h-48 rounded-lg bg-[#283039] p-3 text-sm placeholder:text-[#9caaba] focus:outline-none"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
          <button onClick={parseInput} className="h-10 px-4 rounded-lg bg-[#0d78f2] font-bold">
            Parse
          </button>
          {error && <p className="text-red-400">{error}</p>}
        </section>

        {items.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xl font-semibold">2) Pick a Trending Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setSelected(it)}
                  className={`flex gap-3 p-3 rounded-lg bg-[#1a1f25] text-left border ${
                    selected?.id === it.id ? 'border-[#0d78f2]' : 'border-transparent'
                  }`}
                >
                  <img
                    src={it.thumbnail || 'https://via.placeholder.com/160x90'}
                    alt={it.title}
                    className="w-28 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{it.title}</p>
                    <p className="text-xs text-[#9caaba]">
                      {it.channel?.title || 'Unknown'} • {it.views?.toLocaleString?.() || '—'} views
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {selected && (
          <section className="space-y-3">
            <h3 className="text-xl font-semibold">3) Optional Subjects</h3>
            <input
              className="w-full rounded-lg bg-[#283039] h-12 p-3 placeholder:text-[#9caaba] focus:outline-none"
              placeholder='e.g., "Tung Tung Tung Sahur vs Trallelero Trallala over John Pork"'
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
            />
            <button
              onClick={generatePrompt}
              disabled={loading}
              className="h-10 px-4 rounded-lg bg-[#0d78f2] font-bold disabled:opacity-60"
            >
              {loading ? 'Generating…' : 'Generate Video Prompt'}
            </button>
          </section>
        )}

        {videoPrompt && (
          <section className="space-y-3">
            <h3 className="text-xl font-semibold">4) Video Prompt</h3>
            <textarea
              className="w-full h-40 rounded-lg bg-[#1a1f25] p-3 text-sm"
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={copy} className="h-10 px-4 rounded-lg bg-[#283039] font-bold">
                Copy
              </button>
              <button onClick={useInGenerator} className="h-10 px-4 rounded-lg bg-[#0d78f2] font-bold">
                Use in Generator
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}