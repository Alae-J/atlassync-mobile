/** Auth */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  role: string;
}

export interface User {
  userId: number;
  email: string;
  role: string;
}

/** Products */
export interface Product {
  id: number;
  barcode: string;
  name: string;
  brand: string | null;
  price: number;
  currencyCode: string;
  categoryId: number | null;
  aisleNumber: number | null;
  imageUrl: string | null;
  nutriscoreGrade: string | null;
  novaGroup: number | null;
  ingredientsText: string | null;
  allergenCodes: string[] | null;
  stockQuantity: number;
  rfidSecurityRequired: boolean;
  nutriments: Record<string, unknown> | null;
  attributes: Record<string, unknown> | null;
}

/** Cart */
export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtAddition: number;
  imageUrl: string | null;
  addedAt: string;
}

export interface CartSnapshot {
  sessionId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CartUpdateEvent {
  sessionId: string;
  eventType: 'ITEM_ADDED' | 'ITEM_REMOVED' | 'CART_CLEARED';
  snapshot: CartSnapshot;
}

/** Sessions */
export interface QrData {
  correlationId: string;
  payload: string;
  signature: string;
  expiresAt: string;
}

export interface StartSessionResponse {
  sessionId: string;
  status: string;
  entryQr: QrData;
}

export interface PaymentResponse {
  sessionId: string;
  status: string;
  exitQr: QrData;
}

export interface GateValidationResponse {
  valid: boolean;
  sessionId: string | null;
  message: string;
}

export interface SessionInfo {
  sessionId: string;
  userId: number;
  status: string;
  createdAt: string;
}
