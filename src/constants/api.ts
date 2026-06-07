import Constants from 'expo-constants';

/**
 * Resolves the gateway URL (port 8080) the mobile app talks to.
 *
 * - In Expo dev: `Constants.expoConfig.hostUri` exposes the LAN IP your laptop is bound on,
 *   so a real iPhone on the same Wi-Fi reaches the gateway at `http://<laptop-ip>:8080`
 *   without any hardcoding.
 * - When `EXPO_PUBLIC_API_BASE_URL` is set, it overrides everything (useful for staging,
 *   physical builds, CI).
 * - Last-resort fallback is `localhost:8080`, which only works for the iOS simulator on
 *   the same machine.
 */
const explicit = process.env.EXPO_PUBLIC_API_BASE_URL;
const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();

export const API_BASE_URL =
  explicit ?? (debuggerHost ? `http://${debuggerHost}:8080` : 'http://localhost:8080');

export const WS_URL = `ws://${API_BASE_URL.replace(/^https?:\/\//, '')}/ws`;

export const Endpoints = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    sendEmailVerification: '/api/auth/email/send-verification',
    verifyEmail: '/api/auth/email/verify',
    passwordReset: {
      request: '/api/auth/password/reset/request',
      confirm: '/api/auth/password/reset/confirm',
    },
    me: {
      username: '/api/auth/me/username',
      password: '/api/auth/me/password',
      phoneRequest: '/api/auth/me/phone/request',
      phoneVerify: '/api/auth/me/phone/verify',
      preferences: '/api/auth/me/preferences',
    },
  },
  products: {
    byBarcode: (barcode: string) => `/api/products/${barcode}`,
    search: '/api/products/search',
    batch: '/api/products/batch',
  },
  sessions: {
    start: '/api/sessions/start',
    get: (id: string) => `/api/sessions/${id}`,
    pay: (id: string) => `/api/sessions/${id}/pay`,
    cancel: (id: string) => `/api/sessions/${id}/cancel`,
    receipt: (id: string) => `/api/sessions/${id}/receipt`,
    history: '/api/sessions/history',
  },
  gate: {
    entry: '/api/gate/entry',
    exit: '/api/gate/exit',
  },
  cart: {
    items: (sessionId: string) => `/api/cart/${sessionId}/items`,
    removeItem: (sessionId: string, barcode: string) => `/api/cart/${sessionId}/items/${barcode}`,
    get: (sessionId: string) => `/api/cart/${sessionId}`,
    help: (sessionId: string) => `/api/cart/${sessionId}/help`,
    clear: (sessionId: string) => `/api/cart/${sessionId}`,
  },
} as const;
