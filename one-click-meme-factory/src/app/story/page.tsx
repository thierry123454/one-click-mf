'use client';
import { useEffect, useMemo, useState } from 'react';

type Entity = {
  name: string;
  type: 'game' | 'franchise_or_show' | 'meme_series' | 'creator_or_channel' | 'challenge_or_format' | 'sound_or_song' | 'topic_or_event' | string;
  evidence_lines?: number[];
  aliases?: string[];
  strength?: 'low' | 'med' | 'high' | string;
};

type Analysis = {
  entities?: Entity[];
  meme_hooks?: string[];
  style_cues?: string[];
};

type PromptResp = { video_prompt: string };

export default function StoryBuilder() {
  const [region, setRegion] = useState('GB');
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // selections
  const [selEntities, setSelEntities] = useState<string[]>([]);
  const [selHooks, setSelHooks] = useState<string[]>([]);
  const [selStyles, setSelStyles] = useState<string[]>([]);
  const [subjects, setSubjects] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  const fetchTrends = async () => {
    try {
      setError(null);
      setLoadingTrends(true);
      setVideoPrompt('');
      const r = await fetch(`/api/trends?region=${encodeURIComponent(region)}&max=15`, { method: 'GET' });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setAnalysis(data.analysis || null);
      setSelEntities([]);
      setSelHooks([]);
      setSelStyles([]);
    } catch (e: any) {
      setAnalysis(null);
      setError(e?.message || 'Failed to fetch trends.');
    } finally {
      setLoadingTrends(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  const LIMITS = { entities: 3, hooks: 1, styles: 2 };

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string, limit: number) => {
    setArr((prev) => {
      if (prev.includes(val)) return prev.filter((x) => x !== val);
      if (prev.length >= limit) return prev; // enforce max
      return [...prev, val];
    });
  };

  // Build a compact summary that /api/story uses as item.title
  const trendTitle = useMemo(() => {
    const parts: string[] = [];
    if (selEntities.length) parts.push(`Entities: ${selEntities.join(', ')}`);
    if (selHooks.length) parts.push(`Hook: ${selHooks.join(' / ')}`);
    if (selStyles.length) parts.push(`Style: ${selStyles.join(', ')}`);
    return parts.join(' | ') || 'Trending meme';
  }, [selEntities, selHooks, selStyles]);

  const generatePrompt = async () => {
    setLoadingPrompt(true);
    setVideoPrompt('');
    setError(null);
    try {
      const r = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: { title: trendTitle }, // your /api/story reads item.title
          subjects,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = (await r.json()) as PromptResp;
      setVideoPrompt(data.video_prompt || '');
    } catch (e: any) {
      setError(e?.message || 'Failed to generate prompt.');
    } finally {
      setLoadingPrompt(false);
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
    window.location.href = '/generate';
  };

  const Pill = ({
    text,
    selected,
    onClick,
    sub,
  }: { text: string; selected: boolean; onClick: () => void; sub?: string }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-sm border text-left transition
        ${selected
          ? 'bg-gradient-to-r from-[#0ea5e9] to-[#7c3aed] border-transparent text-white shadow-lg shadow-[#0ea5e9]/20'
          : 'bg-[#11171d] border-[#283039] text-white hover:bg-[#16202a]'
        }`}
      title={sub || ''}
    >
      <span className="font-medium">{text}</span>
      {sub ? <span className="ml-2 text-[11px] opacity-75">{sub}</span> : null}
    </button>
  );

  // Group entities by type for nicer display (optional)
  const entitiesByType = useMemo(() => {
    const map = new Map<string, Entity[]>();
    (analysis?.entities || []).forEach((e) => {
      const key = e.type || 'other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [analysis]);

  return (
    <div className="relative min-h-screen bg-[#0b0f14] text-white overflow-hidden">
      {/* BG glow blobs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[40rem] w-[40rem] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(ellipse at center, #00d4ff33, transparent 60%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(ellipse at center, #7c3aed33, transparent 60%)' }}
      />

      <header className="relative z-10 border-b border-white/10 px-6 py-3 flex items-center justify-between backdrop-blur">
        <h2 className="text-lg font-extrabold tracking-tight">
          Meme Factory — <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#7c3aed]">Trend Picker</span>
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-white/70">Region</label>
          <input
            className="h-9 w-24 rounded bg-[#11171d] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40 border border-white/10"
            value={region}
            onChange={(e) => setRegion(e.target.value.toUpperCase())}
            title="ISO code, e.g., GB, US, IN"
          />
          <button
            onClick={fetchTrends}
            className="h-9 px-3 rounded bg-[#0d78f2] font-semibold disabled:opacity-60 shadow-lg shadow-[#0d78f2]/30 hover:brightness-110 transition"
            disabled={loadingTrends}
          >
            {loadingTrends ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl p-6 space-y-6">
        {error && (
          <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            {error}
          </p>
        )}

        {/* Entities */}
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[.06] p-4">
          <div className="flex items-end justify-between">
            <h3 className="text-xl font-semibold">Pick Entities (up to {LIMITS.entities})</h3>
            <span className="text-xs text-white/70">{selEntities.length}/{LIMITS.entities}</span>
          </div>

          {entitiesByType.size === 0 && (
            <p className="text-sm text-white/70">No entities found. Try Refresh.</p>
          )}

          {[...entitiesByType.entries()].map(([type, arr]) => (
            <div key={type} className="space-y-2">
              <div className="text-xs text-white/60 uppercase tracking-wide">
                {type.replaceAll('_',' ')}
              </div>
              <div className="flex flex-wrap gap-2">
                {arr.map((e) => (
                  <Pill
                    key={e.name}
                    text={e.name}
                    sub={e.strength ? `• ${e.strength}` : undefined}
                    selected={selEntities.includes(e.name)}
                    onClick={() => toggle(selEntities, setSelEntities, e.name, LIMITS.entities)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Meme hooks */}
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[.06] p-4">
          <div className="flex items-end justify-between">
            <h3 className="text-xl font-semibold">Meme Hook (pick {LIMITS.hooks})</h3>
            <span className="text-xs text-white/70">{selHooks.length}/{LIMITS.hooks}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(analysis?.meme_hooks || []).map((h) => (
              <Pill
                key={h}
                text={h}
                selected={selHooks.includes(h)}
                onClick={() => toggle(selHooks, setSelHooks, h, LIMITS.hooks)}
              />
            ))}
            {(!analysis?.meme_hooks || analysis.meme_hooks.length === 0) && (
              <p className="text-sm text-white/70">No hooks found.</p>
            )}
          </div>
        </section>

        {/* Style cues */}
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[.06] p-4">
          <div className="flex items-end justify-between">
            <h3 className="text-xl font-semibold">Style Cues (up to {LIMITS.styles})</h3>
            <span className="text-xs text-white/70">{selStyles.length}/{LIMITS.styles}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(analysis?.style_cues || []).map((s) => (
              <Pill
                key={s}
                text={s}
                selected={selStyles.includes(s)}
                onClick={() => toggle(selStyles, setSelStyles, s, LIMITS.styles)}
              />
            ))}
            {(!analysis?.style_cues || analysis.style_cues.length === 0) && (
              <p className="text-sm text-white/70">No style cues found.</p>
            )}
          </div>
        </section>

        {/* Subjects + Generate */}
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[.06] p-4">
          <h3 className="text-xl font-semibold">Optional Subjects</h3>
          <input
            className="w-full rounded-lg bg-[#11171d] h-12 p-3 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40 border border-white/10"
            placeholder='e.g., "Tung Tung Tung Sahur and John Pork"'
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
          />

          <div className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white/70">
            <div className="font-semibold text-white mb-1">Composed Trend Summary</div>
            <div className="whitespace-pre-wrap">{trendTitle}</div>
          </div>

          <button
            onClick={generatePrompt}
            disabled={
              loadingPrompt ||
              (!selEntities.length && !selHooks.length && !selStyles.length)
            }
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#7c3aed] font-extrabold disabled:opacity-60 shadow-xl hover:scale-[1.01] transition"
          >
            {loadingPrompt ? 'Generating…' : 'Generate Video Prompt'}
          </button>
        </section>

        {/* Result */}
        {videoPrompt && (
          <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[.06] p-4">
            <h3 className="text-xl font-semibold">Video Prompt</h3>
            <textarea
              className="w-full h-40 rounded-lg bg-[#11171d] p-3 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40"
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={copy}
                className="h-10 px-4 rounded-lg bg-[#11171d] border border-white/10 font-bold hover:bg-[#16202a] transition"
              >
                Copy
              </button>
              <button
                onClick={useInGenerator}
                className="h-10 px-4 rounded-lg bg-[#0d78f2] font-bold shadow-lg shadow-[#0d78f2]/30 hover:brightness-110 transition"
              >
                Use in Generator
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}