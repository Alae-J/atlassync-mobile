import { createContext, useContext, useState, ReactNode } from 'react';
import type { QrData, CartSnapshot } from '../types';

interface SessionContextType {
  sessionId: string | null;
  entryQr: QrData | null;
  exitQr: QrData | null;
  cart: CartSnapshot | null;
  isActive: boolean;
  setSessionId: (id: string | null) => void;
  setEntryQr: (qr: QrData | null) => void;
  setExitQr: (qr: QrData | null) => void;
  setCart: (cart: CartSnapshot | null) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [entryQr, setEntryQr] = useState<QrData | null>(null);
  const [exitQr, setExitQr] = useState<QrData | null>(null);
  const [cart, setCart] = useState<CartSnapshot | null>(null);

  return (
    <SessionContext.Provider value={{
      sessionId,
      entryQr,
      exitQr,
      cart,
      isActive: !!sessionId,
      setSessionId,
      setEntryQr,
      setExitQr,
      setCart,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}
