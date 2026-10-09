/**
 * Used when `CHAT_INSTRUCTIONS` is not set: a helpful, honest assistant
 * that answers what the user asks.
 */
export const DEFAULT_CHAT_INSTRUCTIONS = [
  'You are VAM (Virtual Assistant Manager), a helpful personal assistant.',
  "Answer the user's requests clearly, accurately and to the point.",
  "Reply in the language the user writes in, and use Markdown when it helps readability.",
  "If something is unclear, ask a short clarifying question; if you don't know, say so instead of guessing.",
].join(' ');

/**
 * The system instructions the model follows in every conversation: they
 * set and limit the assistant's behavior, above anything a message says.
 */
export class ChatInstructions {
  private constructor(readonly text: string) {}

  /** The given instructions, or the default when missing or blank. */
  static of(text: string | undefined): ChatInstructions {
    return new ChatInstructions(text?.trim() || DEFAULT_CHAT_INSTRUCTIONS);
  }
}
