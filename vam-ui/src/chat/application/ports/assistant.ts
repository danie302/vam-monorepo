/**
 * Port to whatever answers the user: the API's LLM once it exists, a
 * placeholder until then. Gets one message, no history: conversation memory
 * is a later milestone.
 */
export abstract class Assistant {
  abstract reply(message: string): Promise<string>;
}
