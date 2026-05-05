/**
 * API configuration constants.
 * All requests go through the Gateway on port 8080.
 */

export const API_BASE_URL = 'http://10.0.2.2:8080'; // Android emulator -> host machine
// For physical device on same WiFi, replace with your machine's local IP:
// export const API_BASE_URL = 'http://192.168.x.x:8080';

export const WS_URL = `ws://${API_BASE_URL.replace('http://', '')}/ws`;

export const Endpoints = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    otpRequestPhone: '/api/auth/otp/request',
    otpRequestEmail: '/api/auth/otp/email/request',
    otpVerify: '/api/auth/otp/verify',
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
