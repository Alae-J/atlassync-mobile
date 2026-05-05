import { api } from './client';
import { Endpoints } from '../constants/api';
import type { AuthResponse } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export const authApi = {
  login(body: LoginPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>(Endpoints.auth.login, body).then((r) => r.data);
  },
  register(body: RegisterPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>(Endpoints.auth.register, body).then((r) => r.data);
  },
  logout(refreshToken: string): Promise<void> {
    return api.post(Endpoints.auth.logout, { refreshToken }).then(() => undefined);
  },
};
