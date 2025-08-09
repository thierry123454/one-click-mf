export const runtime = 'nodejs';

import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { item, subjects } = await req.json();
  const trendTitle = item?.title?.toString?.() || 'Trending meme';

  const system = `You write concise, high-impact video generation prompts.
Reply with the prompt ONLY (no preface, no quotes). Optimize for Runway gen4_turbo.`;
  const user = `
Create ONE prompt for a 5s meme video.
Include: visual style, key actions, camera moves, and energetic tone.
Keep playful, absurd, funny and very meme-able. Trend: "${trendTitle}". Subjects: ${subjects ?? 'none'}.
`;

console.log(user)

  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.9,
  });

  const video_prompt = resp.choices[0]?.message?.content?.trim() || '';
  if (!video_prompt) return new Response('No prompt generated', { status: 500 });

  return new Response(JSON.stringify({ video_prompt }), {
    headers: { 'Content-Type': 'application/json' },
  });
}