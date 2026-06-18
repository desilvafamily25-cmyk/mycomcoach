import { getOpenAI } from '@/lib/openai';
import { getScenarioById } from '@/lib/scenarios';
import type { ChatMessage } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, scenarioId, generalCommSystemPrompt } = await req.json() as {
      messages: ChatMessage[];
      scenarioId?: string;
      generalCommSystemPrompt?: string;
    };

    let systemPrompt = generalCommSystemPrompt;

    if (scenarioId) {
      const scenario = getScenarioById(scenarioId);
      if (!scenario) {
        return Response.json({ error: 'Scenario not found' }, { status: 404 });
      }
      systemPrompt = scenario.systemPrompt;
    }

    if (!systemPrompt) {
      return Response.json({ error: 'No system prompt provided' }, { status: 400 });
    }

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content ?? '';
    return Response.json({ content });
  } catch (err) {
    console.error('patient-response error:', err);
    return Response.json({ error: 'AI error' }, { status: 500 });
  }
}
