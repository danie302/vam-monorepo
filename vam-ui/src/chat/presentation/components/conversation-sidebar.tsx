'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { conversationTitle, type Conversation } from '../../domain/conversation.ts';
import { useChat } from '../chat-provider.tsx';
import { groupByActivity } from '../conversation-groups.ts';

/**
 * The user's conversations: "New chat" on top, then the list grouped by
 * last activity. Each item can be deleted, after a confirmation.
 */
export function ConversationSidebar() {
  const chat = useChat();
  const pathname = usePathname();
  const router = useRouter();
  const activeId = pathname.startsWith('/c/') ? decodeURIComponent(pathname.slice(3)) : null;
  const [toDelete, setToDelete] = useState<Conversation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await chat.remove(toDelete.id);
      if (toDelete.id === activeId) router.push('/');
      setToDelete(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Could not delete the conversation');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box component="nav" aria-label="Conversations" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1.5 }}>
        <Button
          component={NextLink}
          href="/"
          variant="outlined"
          startIcon={<AddIcon />}
          fullWidth
          sx={{ justifyContent: 'flex-start' }}
        >
          New chat
        </Button>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>
        <ConversationList
          conversations={chat.conversations}
          error={chat.conversationsError}
          activeId={activeId}
          isBusy={(id) => {
            const { status } = chat.thread(id);
            return status === 'waiting' || status === 'streaming';
          }}
          onDelete={(conversation) => {
            setDeleteError(null);
            setToDelete(conversation);
          }}
        />
      </Box>

      <Dialog open={Boolean(toDelete)} onClose={() => !deleting && setToDelete(null)}>
        <DialogTitle>Delete conversation?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            “{toDelete && conversationTitle(toDelete)}” and all its messages will be deleted. This
            cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={confirmDelete} loading={deleting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function ConversationList({
  conversations,
  error,
  activeId,
  isBusy,
  onDelete,
}: {
  conversations: Conversation[] | null;
  error: string | null;
  activeId: string | null;
  isBusy: (id: string) => boolean;
  onDelete: (conversation: Conversation) => void;
}) {
  if (error) {
    return (
      <Alert severity="warning" sx={{ mx: 1.5 }}>
        Could not load your conversations. {error}
      </Alert>
    );
  }
  if (!conversations) {
    return (
      <Box sx={{ px: 2 }} aria-label="Loading conversations">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={36} />
        ))}
      </Box>
    );
  }
  if (conversations.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', px: 2.5, py: 1 }}>
        Your conversations will show up here.
      </Typography>
    );
  }
  return (
    <List dense disablePadding>
      {groupByActivity(conversations).map((group) => (
        <li key={group.label}>
          <ul style={{ padding: 0 }}>
            <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'background.paper', fontWeight: 600 }}>
              {group.label}
            </ListSubheader>
            {group.conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === activeId}
                busy={isBusy(conversation.id)}
                onDelete={() => onDelete(conversation)}
              />
            ))}
          </ul>
        </li>
      ))}
    </List>
  );
}

function ConversationItem({
  conversation,
  active,
  busy,
  onDelete,
}: {
  conversation: Conversation;
  active: boolean;
  busy: boolean;
  onDelete: () => void;
}) {
  const title = conversationTitle(conversation);
  return (
    <Box
      component="li"
      sx={{
        position: 'relative',
        mx: 1,
        // The delete button shows on hover, focus, or for the open conversation.
        '& .delete': { opacity: active ? 1 : 0 },
        '&:hover .delete, &:focus-within .delete': { opacity: 1 },
        '@media (hover: none)': { '& .delete': { opacity: 1 } },
      }}
    >
      <ListItemButton
        component={NextLink}
        href={`/c/${conversation.id}`}
        selected={active}
        aria-current={active ? 'page' : undefined}
        sx={{ borderRadius: '10px', pr: 6 }}
      >
        <ListItemText
          primary={title}
          slotProps={{
            primary: {
              noWrap: true,
              title,
              sx: { fontStyle: conversation.title ? 'normal' : 'italic' },
            },
          }}
        />
      </ListItemButton>
      <Box
        sx={{
          position: 'absolute',
          right: 6,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {busy ? (
          <CircularProgress size={16} sx={{ m: 1 }} aria-label="Answering" />
        ) : (
          <IconButton
            className="delete"
            size="small"
            aria-label={`Delete “${title}”`}
            onClick={onDelete}
            sx={{ transition: 'opacity 120ms' }}
          >
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
