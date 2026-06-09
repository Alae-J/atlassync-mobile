import { api } from './client';
import { Endpoints } from '../constants/api';
import type { AuthResponse, UserPreferences } from '../types';

/** Partial-update patch sent to PATCH /api/auth/me/preferences. */
export type PreferencesPatch = Partial<UserPreferences>;

export interface PhoneCodeSent {
  resendCooldownSeconds: number;
  expiresInSeconds: number;
}

/**
 * Personal Details endpoints — all require an authenticated caller. The
 * username + phone-verify routes return a fresh AuthResponse so the mobile
 * can swap in the new JWT (which carries the updated username / phone).
 */
export const meApi = {
  updateUsername(username: string): Promise<AuthResponse> {
    return api
      .patch<AuthResponse>(Endpoints.auth.me.username, { username })
      .then((r) => r.data);
  },
  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return api
      .post(Endpoints.auth.me.password, { currentPassword, newPassword })
      .then(() => undefined);
  },
  requestPhoneCode(phone: string): Promise<PhoneCodeSent> {
    return api
      .post<PhoneCodeSent>(Endpoints.auth.me.phoneRequest, { phone })
      .then((r) => r.data);
  },
  verifyPhone(phone: string, code: string): Promise<AuthResponse> {
    return api
      .post<AuthResponse>(Endpoints.auth.me.phoneVerify, { phone, code })
      .then((r) => r.data);
  },
  updatePreferences(patch: PreferencesPatch): Promise<AuthResponse> {
    return api
      .patch<AuthResponse>(Endpoints.auth.me.preferences, patch)
      .then((r) => r.data);
  },
};
