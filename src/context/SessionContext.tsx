import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cartApi, gateApi, sessionsApi } from '../api';
import type { CartSnapshot, QrData, SessionInfo, StartSessionResponse } from '../types';

interface SessionContextValue {
  sessionId: string | null;
  entryQr: QrData | null;
  exitQr: QrData | null;
  cart: CartSnapshot | null;
  isActive: boolean;
  isStarting: boolean;
  startSession: (storeId?: number) => Promise<StartSessionResponse>;
  refreshCart: () => Promise<CartSnapshot | null>;
  scanItem: (barcode: string) => Promise<CartSnapshot | null>;
  removeItem: (barcode: string) => Promise<CartSnapshot | null>;
  /** @deprecated Use the Stripe flow in review.tsx — this hits the fake
   *  /pay endpoint that bypasses the payment processor. */
  pay: (paymentMethodId?: string) => Promise<QrData>;
  /** Populates exitQr from a completed-session payload, so the walkout
   *  screen has the QR ready when it renders. Called by review.tsx after
   *  waitForSessionStatus returns COMPLETED. */
  applyCompletedSession: (session: SessionInfo) => void;
  cancel: () => Promise<void>;
  validateExit: () => Promise<void>;
  reset: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [entryQr, setEntryQr] = useState<QrData | null>(null);
  const [exitQr, setExitQr] = useState<QrData | null>(null);
  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const reset = useCallback(() => {
    setSessionId(null);
    setEntryQr(null);
    setExitQr(null);
    setCart(null);
  }, []);

  const startSession = useCallback(async (storeId?: number) => {
    setIsStarting(true);
    try {
      const res = await sessionsApi.start({ storeId });
      setSessionId(res.sessionId);
      setEntryQr(res.entryQr);
      setExitQr(null);
      setCart(null);
      return res;
    } finally {
      setIsStarting(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!sessionId) return null;
    const snapshot = await cartApi.get(sessionId);
    setCart(snapshot);
    return snapshot;
  }, [sessionId]);

  const scanItem = useCallback(
    async (barcode: string) => {
      if (!sessionId) return null;
      await cartApi.addItem(sessionId, { barcode });
      return refreshCart();
    },
    [sessionId, refreshCart],
  );

  const removeItem = useCallback(
    async (barcode: string) => {
      if (!sessionId) return null;
      await cartApi.removeItem(sessionId, barcode);
      return refreshCart();
    },
    [sessionId, refreshCart],
  );

  const pay = useCallback(
    async (paymentMethodId?: string) => {
      if (!sessionId) throw new Error('No active session');
      const res = await sessionsApi.pay(sessionId, { paymentMethodId });
      setExitQr(res.exitQr);
      return res.exitQr;
    },
    [sessionId],
  );

  const applyCompletedSession = useCallback((session: SessionInfo) => {
    if (session.exitQr) setExitQr(session.exitQr);
  }, []);

  const cancel = useCallback(async () => {
    if (!sessionId) return;
    await sessionsApi.cancel(sessionId);
    reset();
  }, [sessionId, reset]);

  const validateExit = useCallback(async () => {
    if (!exitQr) return;
    await gateApi.exit({ correlationId: exitQr.correlationId });
  }, [exitQr]);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        entryQr,
        exitQr,
        cart,
        isActive: !!sessionId,
        isStarting,
        startSession,
        refreshCart,
        scanItem,
        removeItem,
        pay,
        applyCompletedSession,
        cancel,
        validateExit,
        reset,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
