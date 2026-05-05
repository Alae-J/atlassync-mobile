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

export interface OtpRequestResponse {
  correlationId: string;
  resendInSeconds: number;
  expiresInSeconds: number;
}

export interface OtpVerifyPayload {
  correlationId: string;
  code: string;
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
  requestOtpForPhone(phone: string): Promise<OtpRequestResponse> {
    return api
      .post<OtpRequestResponse>(Endpoints.auth.otpRequestPhone, { phone })
      .then((r) => r.data);
  },
  requestOtpForEmail(email: string): Promise<OtpRequestResponse> {
    return api
      .post<OtpRequestResponse>(Endpoints.auth.otpRequestEmail, { email })
      .then((r) => r.data);
  },
  verifyOtp(body: OtpVerifyPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>(Endpoints.auth.otpVerify, body).then((r) => r.data);
  },
};
