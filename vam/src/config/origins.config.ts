/** The Next.js app (`vam-ui/`) in development: `npm run dev` there. */
const DEV_WEB_ORIGIN = 'http://localhost:3001';

/**
 * Web app origins allowed to call the API with the session cookie (CORS
 * with credentials). Comma separated in `WEB_ORIGINS`; when unset, only the
 * local web app is trusted, and nothing in production.
 */
export const trustedOrigins = (
  process.env.WEB_ORIGINS ??
  (process.env.NODE_ENV === 'production' ? '' : DEV_WEB_ORIGIN)
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
