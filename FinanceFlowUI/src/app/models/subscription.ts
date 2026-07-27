export interface Subscription {
  subscriptionId: number;
  userId: number;
  subscriptionName: string;
  category: string;
  amount: number;
  billingCycle: string;
  nextPayment: string;
  paymentMethod?: string;
  status: string;
}