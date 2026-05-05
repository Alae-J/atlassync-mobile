import { api } from './client';
import { Endpoints } from '../constants/api';
import type { Product } from '../types';

export const productsApi = {
  byBarcode(barcode: string): Promise<Product> {
    return api.get<Product>(Endpoints.products.byBarcode(barcode)).then((r) => r.data);
  },
  search(query: string): Promise<Product[]> {
    return api
      .get<Product[]>(Endpoints.products.search, { params: { q: query } })
      .then((r) => r.data);
  },
  batch(barcodes: string[]): Promise<Product[]> {
    return api
      .get<Product[]>(Endpoints.products.batch, { params: { barcodes: barcodes.join(',') } })
      .then((r) => r.data);
  },
};
