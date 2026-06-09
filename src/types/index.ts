/** Auth */
export interface UserPreferences {
  defaultStoreId: number | null;
  currencyCode: string;
  dietaryPrefs: string[];
  allergens: string[];
  notificationPrefs: Record<string, boolean>;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  username: string | null;
  role: string;
  emailVerified: boolean;
  phone: string | null;
  preferences: UserPreferences;
}

export interface User {
  userId: number;
  email: string;
  username: string | null;
  role: string;
  emailVerified: boolean;
  phone: string | null;
  preferences: UserPreferences;
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

export interface PaymentIntentResponse {
  sessionId: string;
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
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
  exitQr?: QrData | null;
}

/** Frozen line item snapshotted from the cart at payment time. */
export interface ReceiptLineItem {
  barcode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
  addedAt: string | null;
}

/** Full receipt view — session metadata plus the frozen items list. */
export interface ReceiptResponse {
  sessionId: string;
  userId: number;
  storeId: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  totalAmount: number | null;
  itemCount: number | null;
  items: ReceiptLineItem[];
}

/** Summary row for the Orders tab and Home "Recent Shops" list. */
export interface SessionHistoryItem {
  sessionId: string;
  storeId: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  totalAmount: number | null;
  itemCount: number | null;
}

/** Shopping lists */
export interface ShoppingListItem {
  barcode: string;
  qty: number;
}

export interface ShoppingListSummary {
  id: number;
  name: string;
  itemCount: number;
  totalEstimate: number | null;
  updatedAt: string;
}

export interface ShoppingListDetail {
  id: number;
  name: string;
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}

/** Analytics */
export interface MonthlySpendCurrent {
  yearMonth: string;
  totalSpend: number;
  tripCount: number;
  avgTrip: number;
  currency: string;
}

export interface MonthlySpendHistoryItem {
  yearMonth: string;
  totalSpend: number;
  tripCount: number;
}

export interface MonthlySpendResponse {
  currentMonth: MonthlySpendCurrent;
  history: MonthlySpendHistoryItem[];
}
