import { sessionsApi } from '../api';
import type { SessionInfo } from '../types';

/**
 * Polls {@code GET /sessions/{id}} until the session reaches the desired
 * status — used after Stripe PaymentSheet confirms, while we wait for
 * the webhook to mark the session COMPLETED. Webhook delivery from Stripe
 * is usually sub-second but can take a few seconds in dev.
 *
 * Returns the final session payload (which carries {@code exitQr} on
 * COMPLETED). Throws if the timeout elapses or the session lands in a
 * terminal non-target status (e.g. CANCELLED).
 */
export async function waitForSessionStatus(
  sessionId: string,
  targetStatus: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<SessionInfo> {
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const intervalMs = opts.intervalMs ?? 1_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const session = await sessionsApi.get(sessionId);
    if (session.status === targetStatus) return session;
    if (session.status === 'CANCELLED') {
      throw new Error('Session was cancelled while waiting for payment.');
    }
    await sleep(intervalMs);
  }
  throw new Error(
    `Timed out waiting for session ${sessionId} to reach ${targetStatus}.`,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
