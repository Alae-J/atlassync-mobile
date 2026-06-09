import { api } from './client';
import { Endpoints } from '../constants/api';
import type { MonthlySpendResponse } from '../types';

export const analyticsApi = {
  monthlySpend(): Promise<MonthlySpendResponse> {
    return api.get<MonthlySpendResponse>(Endpoints.analytics.monthlySpend).then((r) => r.data);
  },
};
