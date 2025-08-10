export const runtime = 'nodejs';

import OpenAI from 'openai';

const YT_KEY = process.env.YOUTUBE_API_KEY!;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type YTItem = {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
    thumbnails?: { high?: { url?: string } };
    categoryId?: string;
  };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails?: { duration?: string; definition?: string };
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const region = (searchParams.get('region') || 'GB').toUpperCase();
    const maxResults = Math.min(Math.max(parseInt(searchParams.get('max') || '25', 20), 1), 30);
    const videoCategoryId = searchParams.get('categoryId') || ''; // e.g., "10" for Music

    if (!YT_KEY) {
      return new Response('Missing YOUTUBE_API_KEY', { status: 500 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return new Response('Missing OPENAI_API_KEY', { status: 500 });
    }

    const ytUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    ytUrl.searchParams.set('part', 'snippet,statistics,contentDetails');
    ytUrl.searchParams.set('chart', 'mostPopular');
    ytUrl.searchParams.set('regionCode', region);
    ytUrl.searchParams.set('maxResults', String(maxResults));
    if (videoCategoryId) ytUrl.searchParams.set('videoCategoryId', videoCategoryId);
    ytUrl.searchParams.set('key', YT_KEY);

    const ytRes = await fetch(ytUrl.toString(), { method: 'GET' });
    if (!ytRes.ok) {
      const txt = await ytRes.text();
      return new Response(`YouTube API error: ${txt}`, { status: 502 });
    }
    const ytJson = await ytRes.json();

    const items: YTItem[] = ytJson.items || [];
    const simplified = items.map((v) => ({
      id: v.id,
      title: v.snippet?.title || '',
      channel: v.snippet?.channelTitle || '',
      publishedAt: v.snippet?.publishedAt || '',
      views: Number(v.statistics?.viewCount || 0),
      duration: v.contentDetails?.duration || '',
      tags: (v.snippet?.tags || []).slice(0, 6), // keep it short for the LLM
      thumb: v.snippet?.thumbnails?.high?.url || '',
      categoryId: v.snippet?.categoryId || '',
    }));

    // Build a compact digest for the LLM (keeps tokens low)
    const digest = simplified
      .slice(0, maxResults)
      .map((x, i) =>
        [
          `${i + 1}. ${x.title}`,
          `ch:${x.channel}`,
          `views:${x.views}`,
          `dur:${x.duration}`,
          x.tags?.length ? `tags:${x.tags.join(', ')}` : ''
        ].filter(Boolean).join(' | ')
      )
      .join('\n');

    console.log(digest);

    const system =
      'You are a short-form video trend analyst. Identify viral themes & hype categories for memeable content. Be concise and useful for creators.';
    const user = `
INPUT DIGEST (numbered lines):
${digest}

TASK:
1) Extract named entities that people are talking about or making content with.
2) Group them by a strict type enum.
3) Propose meme hooks + style cues grounded in those entities.

BANNED_GENERIC = ["music videos","cinematic trailers","trailers","gaming videos","vlogs","reaction","compilation","podcast","livestream"]

TYPES = ["game","franchise_or_show","meme_series","creator_or_channel","challenge_or_format","sound_or_song","topic_or_event"]

OUTPUT JSON ONLY (no prose). Example:
{
  "entities": [
    { "name": "Among Us", "type": "game", "evidence_lines": [3], "aliases": ["AMONG US"], "strength": "high" },
    { "name": "Skibidi Toilet", "type": "meme_series", "evidence_lines": [8], "aliases": ["skibidi"], "strength": "high" },
    { "name": "Call of Duty: Warzone", "type": "game", "evidence_lines": [12], "aliases": ["Warzone"], "strength": "high" },
    { "name": "MrBeast", "type": "creator_or_channel", "evidence_lines": [9], "aliases": ["MrBeast Gaming"], "strength": "high" },
    { "name": "Minecraft", "type": "game", "evidence_lines": [15], "aliases": [], "strength": "high" },
    { "name": "The Boys", "type": "franchise_or_show", "evidence_lines": [5], "aliases": [], "strength": "med" },
    { "name": "Tulsa King", "type": "franchise_or_show", "evidence_lines": [11], "aliases": [], "strength": "med" }
  ],
  "meme_hooks": [
    "POV: Your squad queues Warzone and the gulag is actually a talent show",
    "When the Skibidi multiverse leaks into your kitchen",
    "Among Us emergency meeting… but it's a wedding"
  ],
  "style_cues": [
    "hard whip-pans + VHS grain",
    "caption bars with bold emoji beats",
    "speed ramp into punch-in on reveal"
  ]
}

RULES:
- Minimum 8 entities. Prefer proper nouns from titles/tags.
- Each entity must list evidence_lines referencing the numbered digest lines.
- If an item is generic, exclude it (respect BANNED_GENERIC).
- Do not include 'cut' instructions in style_cues.
- JSON only.
`;

    const ai = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      // keep response small-ish
      max_tokens: 500
    });

    const text = ai.choices[0]?.message?.content?.trim() || '{}';
    let analysis: any;
    try {
      analysis = JSON.parse(text);
    } catch {
      analysis = { raw: text }; // fallback if model didn't return valid JSON
    }

    return new Response(
      JSON.stringify(
        {
          fetchedAt: new Date().toISOString(),
          params: { region, maxResults, videoCategoryId },
          items: simplified,
          analysis
        },
        null,
        2
      ),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}