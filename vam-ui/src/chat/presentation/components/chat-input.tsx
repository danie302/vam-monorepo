'use client';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { brand } from '../../../shared/presentation/theme/brand.ts';
import { MESSAGE_MAX_LENGTH } from '../../domain/message.ts';

/** Shows the character count once the message gets this close to the limit. */
const COUNTER_THRESHOLD = MESSAGE_MAX_LENGTH - 500;

/**
 * The message box: grows with the text, Enter sends, Shift+Enter adds a
 * line. Typing is allowed while waiting for an answer; sending is not.
 */
export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => Promise<boolean>;
  disabled: boolean;
}) {
  const [text, setText] = useState('');
  const tooLong = text.trim().length > MESSAGE_MAX_LENGTH;
  const canSend = !disabled && text.trim().length > 0 && !tooLong;

  async function send() {
    if (!canSend) return;
    const sent = text;
    setText('');
    if (!(await onSend(sent))) setText(sent);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send();
  }

  function keyDown(event: KeyboardEvent) {
    // isComposing: Enter confirms an IME composition (e.g. accents), not a send.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <Box component="form" onSubmit={submit}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          pl: 2.5,
          pr: 1,
          py: 1,
          borderRadius: 4,
          border: 1,
          borderColor: tooLong ? 'error.main' : 'divider',
          transition: 'border-color 150ms, box-shadow 150ms',
          '&:focus-within': {
            borderColor: tooLong ? 'error.main' : 'primary.main',
            boxShadow: (theme) => `0 0 0 3px ${theme.alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        <InputBase
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={keyDown}
          placeholder="Message VAM…"
          multiline
          maxRows={8}
          autoFocus
          fullWidth
          inputProps={{ 'aria-label': 'Message' }}
          sx={{ py: 0.75, fontSize: '1rem' }}
        />
        <IconButton
          type="submit"
          aria-label="Send message"
          disabled={!canSend}
          sx={{
            color: '#fff',
            backgroundImage: brand.gradient,
            '&:hover': { backgroundImage: brand.gradient, filter: 'brightness(1.1)' },
            '&.Mui-disabled': {
              backgroundImage: 'none',
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled',
            },
          }}
        >
          <ArrowUpwardIcon />
        </IconButton>
      </Paper>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, px: 1.5, mt: 0.75 }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Enter to send · Shift + Enter for a new line
        </Typography>
        {text.length > COUNTER_THRESHOLD && (
          <Typography
            variant="caption"
            sx={{ color: tooLong ? 'error.main' : 'text.secondary' }}
          >
            {text.trim().length}/{MESSAGE_MAX_LENGTH}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
