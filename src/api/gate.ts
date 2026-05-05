import { api } from './client';
import { Endpoints } from '../constants/api';
import type { GateValidationResponse } from '../types';

export interface GateScanPayload {
  payload: string;
  signature: string;
}

export const gateApi = {
  entry(body: GateScanPayload): Promise<GateValidationResponse> {
    return api.post<GateValidationResponse>(Endpoints.gate.entry, body).then((r) => r.data);
  },
  exit(body: GateScanPayload): Promise<GateValidationResponse> {
    return api.post<GateValidationResponse>(Endpoints.gate.exit, body).then((r) => r.data);
  },
};
