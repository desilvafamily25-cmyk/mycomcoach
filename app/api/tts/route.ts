import { getOpenAI } from '@/lib/openai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { text, voice = 'alloy' } = await req.json() as { text: string; voice?: string };

    if (!text || text.length > 500) {
      return Response.json({ error: 'Invalid text' }, { status: 400 });
    }

    const mp3 = await getOpenAI().audio.speech.create({
      model: 'tts-1',
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('TTS error:', err);
    return Response.json({ error: 'TTS failed' }, { status: 500 });
  }
}
