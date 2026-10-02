import Box from '@mui/material/Box';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Element overrides: links open in a new tab, wide tables scroll inside the
 * bubble. Raw HTML in the text is not rendered (react-markdown's default),
 * so model output cannot inject markup.
 */
const components: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <Box sx={{ overflowX: 'auto', my: 1.5 }}>
      <table>{children}</table>
    </Box>
  ),
};

/**
 * Renders the assistant's Markdown (GitHub flavor: tables, strikethrough,
 * task lists) with the app's typography. While an answer streams, an
 * unclosed `**` shows as is until its closing pair arrives.
 */
export function MarkdownContent({ children }: { children: string }) {
  return (
    <Box
      sx={(theme) => ({
        ...theme.typography.body1,
        overflowWrap: 'anywhere',
        // Spacing between blocks, none around the edges of the bubble.
        '& > :first-child': { mt: 0 },
        '& > :last-child': { mb: 0 },
        '& p': { my: 1 },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          mt: 2,
          mb: 1,
          lineHeight: 1.3,
          fontWeight: 700,
        },
        '& h1': { fontSize: '1.375rem' },
        '& h2': { fontSize: '1.25rem' },
        '& h3': { fontSize: '1.125rem' },
        '& h4, & h5, & h6': { fontSize: '1rem' },
        '& ul, & ol': { my: 1, pl: 3 },
        '& li': { my: 0.5 },
        '& li > p': { my: 0.5 },
        '& li:has(> input[type=checkbox])': { listStyle: 'none', ml: -2.5 },
        '& a': { color: 'primary.main', textUnderlineOffset: '2px' },
        '& blockquote': {
          my: 1.5,
          mx: 0,
          pl: 2,
          borderLeft: 3,
          borderColor: 'secondary.main',
          color: 'text.secondary',
        },
        '& hr': { my: 2, border: 0, borderTop: 1, borderColor: 'divider' },
        '& code': {
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: '0.875em',
          px: 0.5,
          py: 0.25,
          borderRadius: '6px',
          bgcolor: 'action.hover',
        },
        '& pre': {
          my: 1.5,
          p: 1.5,
          borderRadius: '10px',
          overflowX: 'auto',
          bgcolor: 'action.hover',
          border: 1,
          borderColor: 'divider',
          // Code keeps its lines: scroll instead of wrapping.
          overflowWrap: 'normal',
        },
        '& pre code': { p: 0, bgcolor: 'transparent', fontSize: '0.8125rem' },
        '& table': { borderCollapse: 'collapse', fontSize: '0.875rem' },
        '& th, & td': {
          px: 1.5,
          py: 0.75,
          border: 1,
          borderColor: 'divider',
          textAlign: 'left',
        },
        '& th': { fontWeight: 700, bgcolor: 'action.hover' },
      })}
    >
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </Markdown>
    </Box>
  );
}
