import { ChatMessage } from '../domain/chat-message.ts';
import { Conversation } from '../domain/conversation.ts';
import { ConversationRepository } from '../domain/conversation.repository.ts';

/**
 * What every `ConversationRepository` must do, whatever database is behind
 * it. `create` gets the ids of users that exist (for foreign keys).
 */
export function conversationRepositoryContract(
  create: () => Promise<{ repository: ConversationRepository; users: [string, string] }>,
) {
  let repository: ConversationRepository;
  let ada: string;
  let bob: string;

  beforeEach(async () => {
    ({ repository, users: [ada, bob] } = await create());
  });

  it('finds a created conversation for its owner only', async () => {
    const conversation = Conversation.create(ada);
    await repository.create(conversation);

    expect((await repository.findForUser(conversation.id, ada))?.toProps()).toEqual(
      conversation.toProps(),
    );
    expect(await repository.findForUser(conversation.id, bob)).toBeNull();
    expect(await repository.findForUser(crypto.randomUUID(), ada)).toBeNull();
  });

  it("lists a user's conversations, most recently active first", async () => {
    const older = Conversation.create(ada, new Date(1000));
    const newer = Conversation.create(ada, new Date(2000));
    await repository.create(older);
    await repository.create(newer);
    await repository.create(Conversation.create(bob));

    expect((await repository.listForUser(ada)).map((c) => c.id)).toEqual([newer.id, older.id]);

    await repository.update(older.withMessage('Hello again', new Date(3000)));

    const listed = await repository.listForUser(ada);
    expect(listed.map((c) => c.id)).toEqual([older.id, newer.id]);
    expect(listed[0].title).toBe('Hello again');
  });

  it('keeps messages in the order they were added, even in the same millisecond', async () => {
    const conversation = Conversation.create(ada);
    await repository.create(conversation);
    const now = new Date(5000);
    const question = ChatMessage.fromUser(conversation.id, 'Hi', now);
    const answer = ChatMessage.fromAssistant(conversation.id, 'Hello!', 'small', now);
    await repository.addMessage(question);
    await repository.addMessage(answer);

    expect((await repository.listMessages(conversation.id)).map((m) => m.toProps())).toEqual([
      question.toProps(),
      answer.toProps(),
    ]);
  });

  it('deletes a conversation with its messages, for its owner only', async () => {
    const conversation = Conversation.create(ada);
    await repository.create(conversation);
    await repository.addMessage(ChatMessage.fromUser(conversation.id, 'Hi'));

    expect(await repository.deleteForUser(conversation.id, bob)).toBe(false);
    expect(await repository.findForUser(conversation.id, ada)).not.toBeNull();

    expect(await repository.deleteForUser(conversation.id, ada)).toBe(true);
    expect(await repository.findForUser(conversation.id, ada)).toBeNull();
    expect(await repository.listMessages(conversation.id)).toEqual([]);
    expect(await repository.deleteForUser(conversation.id, ada)).toBe(false);
  });
}
