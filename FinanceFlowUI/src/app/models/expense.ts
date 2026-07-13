export interface Expense {
  expenseId: number;
  userId: number;
  categoryId: number;
  merchant: string;
  amount: number;
  paymentMethod: string;
  transactionDate: string;
  description: string;
  receiptImage: string;
}