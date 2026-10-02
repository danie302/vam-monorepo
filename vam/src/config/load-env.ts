/**
 * Loads `.env` into `process.env` (Node's built-in loader, no dotenv). It is
 * the first import of `main.ts`: config files read `process.env` when they
 * are imported, so this has to run before them. Variables already set in the
 * environment win; a missing file is fine (production sets real variables).
 */
try {
  process.loadEnvFile('.env');
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}
