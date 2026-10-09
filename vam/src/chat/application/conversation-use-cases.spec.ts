import { ChatMessage } from '../domain/chat-message.ts';
import { ConversationNotFoundError } from '../domain/conversation-not-found.error.ts';
import { InMemoryConversationRepository } from '../infrastructure/in-memory/in-memory-conversation.repository.ts';
import { DeleteConversationUseCase } from './delete-conversation.use-case.ts';
import { GetConversationUseCase } from './get-conversation.use-case.ts';
import { ListConversationsUseCase } from './list-conversations.use-case.ts';
import { StartConversationUseCase } from './start-conversation.use-case.ts';

describe('conversation use cases', () => {
  let conversations: InMemoryConversationRepository;

  beforeEach(() => {
    conversations = new InMemoryConversationRepository();
  });

  it("starts, lists and gets a user's conversations", async () => {
    const started = await new StartConversationUseCase(conversations).execute('ada');
    await conversations.addMessage(ChatMessage.fromUser(started.id, 'Hi'));
    await new StartConversationUseCase(conversations).execute('bob');

    const listed = await new ListConversationsUseCase(conversations).execute('ada');
    const { conversation, messages } = await new GetConversationUseCase(conversations).execute(
      'ada',
      started.id,
    );

    expect(listed.map((c) => c.id)).toEqual([started.id]);
    expect(conversation.title).toBeNull();
    expect(messages.map((m) => m.content)).toEqual(['Hi']);
  });

  it("does not get or delete someone else's conversation", async () => {
    const started = await new StartConversationUseCase(conversations).execute('ada');

    await expect(
      new GetConversationUseCase(conversations).execute('bob', started.id),
    ).rejects.toBeInstanceOf(ConversationNotFoundError);
    await expect(
      new DeleteConversationUseCase(conversations).execute('bob', started.id),
    ).rejects.toBeInstanceOf(ConversationNotFoundError);
  });

  it('deletes a conversation', async () => {
    const started = await new StartConversationUseCase(conversations).execute('ada');

    await new DeleteConversationUseCase(conversations).execute('ada', started.id);

    expect(await new ListConversationsUseCase(conversations).execute('ada')).toEqual([]);
  });
});
