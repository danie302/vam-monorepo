import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { VamMark } from '../../../shared/presentation/components/vam-logo.tsx';

const SUGGESTIONS = [
  'What can you help me with?',
  'Plan my day',
  'Remind me to call mom tomorrow',
  'Summarize a text for me',
];

/** Greeting and starter prompts shown before the first message. */
export function EmptyChat({
  userName,
  onSuggestion,
}: {
  userName?: string;
  onSuggestion: (text: string) => void;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        py: 4,
      }}
    >
      <VamMark size={64} />
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          {userName ? `Hi, ${userName}!` : 'Hi!'}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
          How can I help you today?
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
          maxWidth: 520,
          mt: 1,
        }}
      >
        {SUGGESTIONS.map((suggestion) => (
          <Chip
            key={suggestion}
            label={suggestion}
            variant="outlined"
            clickable
            onClick={() => onSuggestion(suggestion)}
          />
        ))}
      </Box>
    </Box>
  );
}
