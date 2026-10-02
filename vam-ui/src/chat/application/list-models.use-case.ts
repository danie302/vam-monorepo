import { Assistant, type AssistantModels } from './ports/assistant.ts';

/** The models the user can pick, and the default one. */
export class ListModelsUseCase {
  constructor(private readonly assistant: Assistant) {}

  execute(): Promise<AssistantModels> {
    return this.assistant.models();
  }
}
