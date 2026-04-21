// Client helper for the AI chat endpoint.

export type AIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function aiChat(messages: AIChatMessage[], systemPrompt?: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
    });
    if (res.status === 429) {
      return "You're sending messages too fast — give it a few seconds and try again.";
    }
    if (!res.ok) {
      return "I couldn't reach the AI service. Please try again in a moment.";
    }
    const data = (await res.json()) as { reply?: string };
    return data.reply ?? '';
  } catch (err) {
    console.warn('[ai-client] chat threw', err);
    return "I couldn't reach the AI service. Please try again in a moment.";
  }
}
