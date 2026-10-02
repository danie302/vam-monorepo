import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { VamMark } from '../../../shared/presentation/components/vam-logo.tsx';
import { brand } from '../../../shared/presentation/theme/brand.ts';
import type { Message } from '../../domain/message.ts';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });

/** A message: the user's on the right in brand blue, the assistant's on the left. */
export function MessageBubble({ message }: { message: Message }) {
  const fromUser = message.role === 'user';
  return (
    <BubbleRow fromUser={fromUser}>
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderRadius: '18px',
          maxWidth: '100%',
          ...(fromUser
            ? { bgcolor: brand.blue, color: '#fff', borderBottomRightRadius: '6px' }
            : {
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderBottomLeftRadius: '6px',
              }),
        }}
      >
        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
        >
          {message.content}
        </Typography>
      </Box>
      <Typography
        component="time"
        dateTime={message.createdAt.toISOString()}
        variant="caption"
        sx={{ color: 'text.secondary', px: 0.5, mt: 0.5 }}
      >
        {timeFormat.format(message.createdAt)}
      </Typography>
    </BubbleRow>
  );
}

/** Lays out a bubble: aligned to its side, the assistant's with the VAM mark. */
export function BubbleRow({
  fromUser,
  children,
}: {
  fromUser: boolean;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        justifyContent: fromUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      {!fromUser && (
        <Box sx={{ flexShrink: 0, mt: 0.25 }}>
          <VamMark size={32} />
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: fromUser ? 'flex-end' : 'flex-start',
          maxWidth: { xs: '85%', sm: '75%' },
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
