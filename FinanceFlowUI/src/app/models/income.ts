export interface Income {
  incomeId: number;
  userId: number;
  categoryId: number;
  category: string;
  amount: number;
  source: string;
  paymentMethod: string;
  transactionDate: string;
  description: string;
}