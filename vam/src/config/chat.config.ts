/**
 * OpenAI models the chat may use, comma separated in `CHAT_MODELS`; the
 * first one is the default. Only these are accepted, so a client cannot pick
 * an expensive model.
 */
export const chatModels = (
  process.env.CHAT_MODELS ?? 'gpt-5.4-mini,gpt-5.4-nano,gpt-5.4'
)
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);

/** Required to talk to OpenAI; read when the chat module starts. */
export function openAiApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not set: add it to vam/.env (see .env.example)',
    );
  }
  return apiKey;
}
