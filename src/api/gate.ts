import { api } from './client';
import { Endpoints } from '../constants/api';
import type { GateValidationResponse } from '../types';

export interface GateScanPayload {
  /**
   * The QR's correlation id — what a physical gate scanner reads. The
   * session-service uses it to look up the issued QR token and validate the
   * accompanying signature on its side; the mobile doesn't ship the raw
   * payload + signature over the wire for that reason.
   */
  correlationId: string;
}

export const gateApi = {
  entry(body: GateScanPayload): Promise<GateValidationResponse> {
    return api.post<GateValidationResponse>(Endpoints.gate.entry, body).then((r) => r.data);
  },
  exit(body: GateScanPayload): Promise<GateValidationResponse> {
    return api.post<GateValidationResponse>(Endpoints.gate.exit, body).then((r) => r.data);
  },
};
