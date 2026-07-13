export interface Income {
  incomeId: number;
  userId: number;
  categoryId: number;
  amount: number;
  source: string;
  paymentMethod: string;
  transactionDate: string;
  description: string;
}