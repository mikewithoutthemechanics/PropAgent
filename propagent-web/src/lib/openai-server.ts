// LLM client for server-side AI calls (chat replies, valuations, rent AI).
//
// We use Groq Cloud's OpenAI-compatible endpoint. The `openai` SDK works
// against it when we set baseURL. Falls back to a mock if GROQ_API_KEY is
// not set, so previews still work.

import 'server-only';

import OpenAI from 'openai';

const apiKey = process.env.GROQ_API_KEY;

export const openaiConfigured = Boolean(apiKey);

const DEFAULT_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

const client = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  : null;

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function chatComplete(
  messages: ChatMessage[],
  opts: { model?: string; temperature?: number } = {},
): Promise<string> {
  if (!client) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    return mockReply(lastUser);
  }
  const res = await client.chat.completions.create({
    model: opts.model ?? DEFAULT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.5,
  });
  return res.choices[0]?.message?.content?.trim() ?? '';
}

function mockReply(userMsg: string): string {
  const trimmed = userMsg.slice(0, 80);
  return `(demo mode — GROQ_API_KEY not set) I received: "${trimmed}". Configure GROQ_API_KEY at https://console.groq.com/keys to get real AI replies.`;
}
