'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Landing() {
  // lil’ confetti wiggle
  const [wiggle, setWiggle] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setWiggle((w) => !w), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0f14] text-white">
      {/* BG glow blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full blur-[120px]"
           style={{ background: 'radial-gradient(ellipse at center, #00d4ff44, transparent 60%)' }} />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[40rem] w-[40rem] rounded-full blur-[140px]"
           style={{ background: 'radial-gradient(ellipse at center, #7c3aed44, transparent 60%)' }} />

      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 grid place-items-center rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed]">
            <span className="text-xs">🎛️</span>
          </div>
          <h1 className="text-lg font-extrabold tracking-tight">Meme Factory</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          {/* <Link href="/story" className="hover:text-white">Trend Picker</Link>
          <Link href="/generate" className="hover:text-white">Generator</Link>
          <a href="https://projects.hack-nation.ai/" target="_blank" className="hover:text-white">Submit</a> */}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 md:px-10 pt-12 md:pt-20">
        {/* Hero */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
              <span className="animate-pulse">🔥</span> AI Video Gold Rush
            </div>

            <h2 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              One-Click <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#7c3aed]">Meme</span> Factory
            </h2>

            <p className="mt-4 text-white/80 text-base md:text-lg">
              Go from <span className="font-semibold">trend ➝ story ➝ video</span> in minutes.
              We sniff today’s hype, script a chaotic banger, and render it with AI. Ship it before the meme dies.
            </p>

            {/* <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/story"
                className="inline-flex items-center justify-center rounded-xl bg-[#0d78f2] px-6 py-3 font-bold shadow-lg shadow-[#0d78f2]/30 hover:brightness-110 transition"
              >
                Let’s Generate 🚀
              </Link>
              <Link
                href="/generate"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[.06] px-6 py-3 font-semibold hover:bg-white/[.1] transition"
              >
                I’ve got a prompt 🎬
              </Link>
            </div> */}

            {/* Meme marquee */}
            <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-black/30">
              <div className="whitespace-nowrap animate-[marquee_22s_linear_infinite] py-3 px-4 text-sm">
                <span className="opacity-80">
                  🧻 Skibidi Toilet • 🎮 Warzone Gulag • 🛸 Among Us Wedding • 🧠 Italian Brainrot • 🐷 John Pork Returns •
                  🎭 The Boys Trailer Cuts • 🧨 MrBeast “$1,000/min” • 🧩 Minecraft Cobblemon • 🎥 VHS whip-pans & caption bars
                </span>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black">
                {/* fake preview */}
                <video
                    src="https://dnznrvs05pmza.cloudfront.net/71455545-49ac-4e47-990b-a0c8fe653e26.mp4?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzNkNDk3MGViZjUwOTI1ZiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc1NDk1NjgwMH0.F5ijC9hO5mKSSP9N83UPhNYIwe-rpsFK-uMmBW2V4Sg"
                    autoPlay
                    muted
                    playsInline
                    loop
                    controls={false}
                    preload="auto"
                    className="h-full w-full object-cover opacity-70"
                />
                {/* floating emoji stickers */}
                <div className={`absolute left-6 top-6 text-4xl transition-transform ${wiggle ? 'translate-y-1 rotate-3' : '-translate-y-1 -rotate-2'}`}>😂</div>
                <div className={`absolute right-8 top-10 text-3xl transition-transform ${wiggle ? '-rotate-6' : 'rotate-6'}`}>💥</div>
                <div className={`absolute left-10 bottom-10 text-3xl transition-transform ${wiggle ? 'translate-x-1' : '-translate-x-1'}`}>🎮</div>
                <div className={`absolute right-10 bottom-8 text-3xl transition-transform ${wiggle ? 'translate-y-1' : '-translate-y-1'}`}>🎬</div>

                {/* Caption bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                  <div className="rounded-md bg-black/60 px-3 py-2 text-sm font-extrabold tracking-wide">
                    POV: You're in a SIDEMEN video and chaos breaks out over a snack 🍿
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/60 text-center">
              * Demo preview. Click <span className="text-white font-semibold">Pick Trends & Generate ✨</span> to create your own.
            </p>
          </div>
        </section>

        {/* Mini features */}
        <section className="mt-12 grid md:grid-cols-3 gap-4">
          {[
            { icon: '⚡', title: 'Trend Chaser', desc: 'Pull live hype, not stale templates.' },
            { icon: '🧠', title: 'LLM Story Brain', desc: 'Absurd, viral-ready storylines.' },
            { icon: '🎞️', title: 'AI Video Render', desc: 'Runway pipeline: image ➝ 5s clip.' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-white/10 bg-white/[.06] p-4">
              <div className="text-2xl">{f.icon}</div>
              <div className="mt-2 font-bold">{f.title}</div>
              <div className="text-sm text-white/70">{f.desc}</div>
            </div>
          ))}
        </section>

        {/* Big CTA */}
        <section className="mt-10 mb-16 text-center">
          <Link
            href="/story"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0ea5e9] to-[#7c3aed] px-8 py-4 text-lg font-extrabold shadow-xl hover:scale-[1.02] transition"
          >
            Pick Trends & Generate ✨
          </Link>
          <p className="mt-3 text-xs text-white/60">
            Got a prompt 🎬? Jump straight to the <Link href="/generate" className="underline">Video Generator</Link>.
          </p>
        </section>
      </main>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}