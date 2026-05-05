import { api } from './client';
import { Endpoints } from '../constants/api';
import type { PaymentResponse, SessionInfo, StartSessionResponse } from '../types';

export interface StartSessionPayload {
  storeId?: number;
}

export interface PaySessionPayload {
  paymentMethodId?: string;
}

export const sessionsApi = {
  start(body: StartSessionPayload = {}): Promise<StartSessionResponse> {
    return api.post<StartSessionResponse>(Endpoints.sessions.start, body).then((r) => r.data);
  },
  get(sessionId: string): Promise<SessionInfo> {
    return api.get<SessionInfo>(Endpoints.sessions.get(sessionId)).then((r) => r.data);
  },
  pay(sessionId: string, body: PaySessionPayload = {}): Promise<PaymentResponse> {
    return api.post<PaymentResponse>(Endpoints.sessions.pay(sessionId), body).then((r) => r.data);
  },
  cancel(sessionId: string): Promise<void> {
    return api.post(Endpoints.sessions.cancel(sessionId)).then(() => undefined);
  },
};
