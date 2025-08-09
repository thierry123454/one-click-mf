export const runtime = 'nodejs';

import RunwayML, { TaskFailedError } from '@runwayml/sdk';
import { Buffer } from 'node:buffer';

function extractAssetUrl(task: any): string | null {
  // Common shapes for image/video outputs
  if (typeof task?.output === 'string') return task.output;
  if (Array.isArray(task?.output)) {
    const first = task.output[0];
    if (typeof first === 'string') return first;
    if (first?.url) return first.url;
  }
  if (Array.isArray(task?.outputs)) {
    const o = task.outputs[0];
    if (o?.asset_url) return o.asset_url;
    if (o?.url) return o.url;
  }
  if (task?.assets?.image) return task.assets.image;
  if (task?.assets?.video) return task.assets.video;
  if (task?.result?.image) return task.result.image;
  if (task?.result?.video) return task.result.video;
  return null;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const prompt = String(form.get('prompt') || '').trim();
    if (!prompt) return new Response('Missing prompt', { status: 400 });

    // Collect up to 3 reference images (optional)
    const refFiles = form.getAll('images').filter(v => v instanceof File) as File[];
    const referenceImages = await Promise.all(
      refFiles.slice(0, 3).map(async (file, i) => {
        const arr = await file.arrayBuffer();
        const base64 = Buffer.from(arr).toString('base64');
        const mime = file.type || 'image/png';
        return {
          uri: `data:${mime};base64,${base64}`,
          tag: `ref${i + 1}`,
        };
      })
    );

    const client = new RunwayML(); // uses RUNWAY_API_KEY

    // 1) Text -> Image (prefer turbo if refs present; else plain model works too)
    const useTurbo = referenceImages.length > 0;
    const imageTask = await client.textToImage
      .create({
        model: useTurbo ? 'gen4_image_turbo' : 'gen4_image',
        promptText: prompt,
        ratio: '720:1280', // vertical
        ...(useTurbo ? { referenceImages } : {}),
      })
      .waitForTaskOutput();

    const imageUrl = extractAssetUrl(imageTask);
    if (!imageUrl) {
      console.error('Image task shape:', JSON.stringify(imageTask, null, 2));
      return new Response('Failed to create image', { status: 500 });
    }

    // 2) Image -> Video
    const videoTask = await client.imageToVideo
      .create({
        model: 'gen4_turbo',
        promptImage: imageUrl,     // use generated image as the keyframe
        promptText: prompt,        // keep story guidance consistent
        ratio: '720:1280',
        duration: 5,
      })
      .waitForTaskOutput();

    const videoUrl = extractAssetUrl(videoTask);
    if (!videoUrl) {
      console.error('Video task shape:', JSON.stringify(videoTask, null, 2));
      return new Response('Failed to create video', { status: 500 });
    }

    return new Response(JSON.stringify({ imageUrl, videoUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error instanceof TaskFailedError) {
      return new Response(JSON.stringify(error.taskDetails || { error: 'Runway task failed' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: error?.message || 'Server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}