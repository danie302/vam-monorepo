import { RequireAuth } from '../../auth/presentation/auth-guards.tsx';
import { UserMenu } from '../../auth/presentation/components/user-menu.tsx';
import { ConversationSidebar } from '../../chat/presentation/components/conversation-sidebar.tsx';
import { AppShell } from '../../shared/presentation/components/app-shell.tsx';
import { ChatProviders } from './chat-providers.tsx';

/**
 * Signed-in pages. The chat state lives here, above the pages, so an answer
 * keeps streaming while the user moves between conversations.
 */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <RequireAuth>
      <ChatProviders>
        <AppShell actions={<UserMenu />} sidebar={<ConversationSidebar />}>
          {children}
        </AppShell>
      </ChatProviders>
    </RequireAuth>
  );
}
