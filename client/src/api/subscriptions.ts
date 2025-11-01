import api from './Api';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
}

export interface SubscriptionDetails {
  plan: string;
  status: string;
  credits: number;
  creditsUsed: number;
  planDetails: PricingPlan;
  startDate: string | null;
  endDate: string | null;
}

export interface UsageStats {
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
  usagePercentage: number;
  plan: string;
}

export const subscriptionApi = {
  // Get all available pricing plans
  getPlans: async (): Promise<PricingPlan[]> => {
    const response = await api.get('/subscriptions/plans');
    return response.data.plans;
  },

  // Get current user's subscription
  getCurrentSubscription: async (): Promise<SubscriptionDetails> => {
    const response = await api.get('/subscriptions/current');
    return response.data.subscription;
  },

  // Subscribe to a plan
  subscribe: async (plan: string) => {
    const response = await api.post('/subscriptions/subscribe', { plan });
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async () => {
    const response = await api.post('/subscriptions/cancel');
    return response.data;
  },

  // Get usage statistics
  getUsage: async (): Promise<UsageStats> => {
    const response = await api.get('/subscriptions/usage');
    return response.data.usage;
  },

  // Get subscription history
  getHistory: async () => {
    const response = await api.get('/subscriptions/history');
    return response.data.subscriptions;
  },
};

export default subscriptionApi;
