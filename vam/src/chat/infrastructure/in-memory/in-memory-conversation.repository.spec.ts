import { conversationRepositoryContract } from '../conversation-repository.contract-spec.ts';
import { InMemoryConversationRepository } from './in-memory-conversation.repository.ts';

describe('InMemoryConversationRepository', () => {
  conversationRepositoryContract(async () => ({
    repository: new InMemoryConversationRepository(),
    users: ['ada', 'bob'],
  }));
});
