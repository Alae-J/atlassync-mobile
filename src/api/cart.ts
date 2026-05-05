import { api } from './client';
import { Endpoints } from '../constants/api';
import type { CartItem, CartSnapshot } from '../types';

export interface AddToCartPayload {
  barcode: string;
}

export interface HelpRequestPayload {
  aisleNumber?: number;
}

export const cartApi = {
  get(sessionId: string): Promise<CartSnapshot> {
    return api.get<CartSnapshot>(Endpoints.cart.get(sessionId)).then((r) => r.data);
  },
  addItem(sessionId: string, body: AddToCartPayload): Promise<CartItem> {
    return api
      .post<CartItem>(Endpoints.cart.items(sessionId), body)
      .then((r) => r.data);
  },
  removeItem(sessionId: string, barcode: string): Promise<void> {
    return api.delete(Endpoints.cart.removeItem(sessionId, barcode)).then(() => undefined);
  },
  clear(sessionId: string): Promise<void> {
    return api.delete(Endpoints.cart.clear(sessionId)).then(() => undefined);
  },
  requestHelp(sessionId: string, body: HelpRequestPayload = {}): Promise<void> {
    return api.post(Endpoints.cart.help(sessionId), body).then(() => undefined);
  },
};
