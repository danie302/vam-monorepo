/** The models the chat may use; the first is the default. */
export class ChatModels {
  private constructor(private readonly models: readonly string[]) {}

  static of(models: readonly string[]): ChatModels {
    if (models.length === 0) throw new Error('At least one chat model is required');
    return new ChatModels([...new Set(models)]);
  }

  get default(): string {
    return this.models[0];
  }

  get all(): readonly string[] {
    return this.models;
  }

  supports(model: string): boolean {
    return this.models.includes(model);
  }
}
