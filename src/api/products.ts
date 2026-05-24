import { api } from './client';
import { Endpoints } from '../constants/api';
import type { Product } from '../types';

export interface ProductSearchParams {
  query?: string;
  /** Restrict results to a single aisle. Combined with {@code query} if both are set. */
  aisle?: number;
  /** Server caps at 20 by default. */
  limit?: number;
}

export const productsApi = {
  byBarcode(barcode: string): Promise<Product> {
    return api.get<Product>(Endpoints.products.byBarcode(barcode)).then((r) => r.data);
  },
  search(params: ProductSearchParams = {}): Promise<Product[]> {
    return api
      .get<Product[]>(Endpoints.products.search, {
        params: {
          query: params.query ?? '',
          aisle: params.aisle,
          limit: params.limit,
        },
      })
      .then((r) => r.data);
  },
  batch(barcodes: string[]): Promise<Product[]> {
    return api
      .get<Product[]>(Endpoints.products.batch, { params: { barcodes: barcodes.join(',') } })
      .then((r) => r.data);
  },
};
