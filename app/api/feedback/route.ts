import { getOpenAI } from '@/lib/openai';
import { getScenarioById } from '@/lib/scenarios';
import { FEEDBACK_SYSTEM_PROMPT, THOUGHT_FEEDBACK_PROMPT } from '@/lib/openai';
import { countFillerWords } from '@/lib/scoring';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { transcript, scenarioId, phaseType, framework } = await req.json() as {
      transcript: string;
      scenarioId?: string;
      phaseType: 'consultation' | 'thought' | 'warmup' | 'general';
      framework?: string;
    };

    if (!transcript || transcript.trim().length < 20) {
      return Response.json({
        error: 'Transcript too short to evaluate.',
      }, { status: 400 });
    }

    const fillerCount = countFillerWords(transcript);
    const wordCount = transcript.split(/\s+/).filter(Boolean).length;

    let prompt = '';
    let systemPrompt = FEEDBACK_SYSTEM_PROMPT;

    if (phaseType === 'consultation' && scenarioId) {
      const scenario = getScenarioById(scenarioId);
      const scenarioContext = scenario
        ? `Scenario: ${scenario.title}. Patient: ${scenario.patientName}, ${scenario.patientAge}yo. Complaint: ${scenario.chiefComplaint}. Skills being trained: ${scenario.expectedSkills.join(', ')}.`
        : '';

      prompt = `${scenarioContext}

Transcript of doctor's speech:
"""
${transcript}
"""

Filler words detected: ${fillerCount}
Word count: ${wordCount}

Please evaluate this consultation transcript and respond with a JSON object in exactly this format:
{
  "scores": {
    "rapport": <0-10>,
    "clarity": <0-10>,
    "empathy": <0-10>,
    "structure": <0-10>,
    "safety": <0-10>,
    "sharedDecision": <0-10>,
    "teachBack": <0-10>,
    "closing": <0-10>,
    "overall": <0-10>
  },
  "strongMoments": ["<specific quote or moment>", "<another>"],
  "weakMoments": ["<specific quote or area>", "<another>"],
  "bestSentence": "<the single best sentence they said>",
  "worstMoment": "<description of the single weakest moment>",
  "redoPrompt": "<instruction for what to redo in a second attempt, starting with 'Redo..'>",
  "suggestedPhrases": ["<phrase to use instead>", "<another phrase>", "<third phrase>"],
  "summary": "<2-sentence overall summary>",
  "missedCues": ["<cue patient gave that was not picked up>"],
  "fillerWordCount": ${fillerCount},
  "wordCount": ${wordCount}
}`;
    } else if (phaseType === 'thought') {
      systemPrompt = THOUGHT_FEEDBACK_PROMPT;
      prompt = `Framework used: ${framework || 'Unknown'}

Transcript:
"""
${transcript}
"""

Filler words: ${fillerCount}

Respond with JSON:
{
  "scores": { "structure": <0-10>, "clarity": <0-10>, "confidence": <0-10>, "overall": <0-10> },
  "strongMoments": ["<strength>"],
  "weakMoments": ["<weakness>"],
  "summary": "<2-sentence feedback>",
  "redoFocus": "<one specific thing to fix in second attempt>",
  "suggestedOpening": "<better opening sentence>",
  "fillerWordCount": ${fillerCount},
  "wordCount": ${wordCount}
}`;
    } else {
      prompt = `Transcript:
"""
${transcript}
"""

Filler words: ${fillerCount}
Word count: ${wordCount}

Evaluate this communication and respond with JSON:
{
  "scores": { "clarity": <0-10>, "confidence": <0-10>, "empathy": <0-10>, "structure": <0-10>, "overall": <0-10> },
  "strongMoments": ["<strength>"],
  "weakMoments": ["<weakness>"],
  "bestSentence": "<best line>",
  "summary": "<2-sentence feedback>",
  "suggestedPhrases": ["<better phrase>", "<another>"],
  "fillerWordCount": ${fillerCount},
  "wordCount": ${wordCount}
}`;
    }

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(content);
    return Response.json(parsed);
  } catch (err) {
    console.error('feedback error:', err);
    return Response.json({ error: 'Failed to generate feedback' }, { status: 500 });
  }
}
