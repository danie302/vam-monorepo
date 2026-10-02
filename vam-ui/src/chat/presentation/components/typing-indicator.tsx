import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import { brand } from '../../../shared/presentation/theme/brand.ts';
import { BubbleRow } from './message-bubble.tsx';

const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
`;

/** Three bouncing dots in brand colors while the assistant answers. */
export function TypingIndicator() {
  return (
    <BubbleRow fromUser={false}>
      <Box
        role="status"
        aria-label="The assistant is typing"
        sx={{
          display: 'flex',
          gap: 0.75,
          px: 2,
          py: 1.75,
          borderRadius: '18px',
          borderBottomLeftRadius: '6px',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        {[brand.blue, brand.violet, brand.red].map((color, i) => (
          <Box
            key={color}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: color,
              animation: `${bounce} 1.2s ease-in-out ${i * 0.15}s infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          />
        ))}
      </Box>
    </BubbleRow>
  );
}
