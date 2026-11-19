
import { SpotifyApiError, apiErrorMessage } from './spotifyErrors.mjs';

const localCodes = new Set(['network', 'timeout', 'server', 'rate_limited', 'quota_exceeded', 'forbidden', 'not_found']);
export function getApiRecovery(error, now = Date.now()) {
 const known = error instanceof SpotifyApiError;
 const deadline = known && Number.isFinite(error.retryAt) ? error.retryAt : 0;
 return {
   message: apiErrorMessage(error),
   retryAllowed: !known || error.retryable,
   seconds: Math.max(0, Math.ceil((deadline - now) / 1000)),
   showLocalLibrary: known && localCodes.has(error.code),
 };
}
