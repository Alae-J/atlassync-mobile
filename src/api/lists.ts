import { api } from './client';
import { Endpoints } from '../constants/api';
import type { ShoppingListDetail, ShoppingListItem, ShoppingListSummary } from '../types';

export interface CreateListPayload {
  name: string;
  items: ShoppingListItem[];
}

export interface UpdateListPayload {
  name?: string;
  items?: ShoppingListItem[];
}

export const listsApi = {
  list(): Promise<ShoppingListSummary[]> {
    return api.get<ShoppingListSummary[]>(Endpoints.lists.root).then((r) => r.data);
  },
  get(id: number): Promise<ShoppingListDetail> {
    return api.get<ShoppingListDetail>(Endpoints.lists.byId(id)).then((r) => r.data);
  },
  create(body: CreateListPayload): Promise<ShoppingListDetail> {
    return api.post<ShoppingListDetail>(Endpoints.lists.root, body).then((r) => r.data);
  },
  update(id: number, body: UpdateListPayload): Promise<ShoppingListDetail> {
    return api.patch<ShoppingListDetail>(Endpoints.lists.byId(id), body).then((r) => r.data);
  },
  remove(id: number): Promise<void> {
    return api.delete(Endpoints.lists.byId(id)).then(() => undefined);
  },
};
