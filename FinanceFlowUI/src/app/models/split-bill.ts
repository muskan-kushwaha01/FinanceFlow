export interface SplitBillParticipant {
  participantId?: number;
  splitBillId?: number;
  participantName: string;
  amountOwed: number;
  amountPaid: number;
  createdAt?: string;
}

export interface SplitBill {
  splitBillId?: number;
  userId?: number;

  billName: string;
  totalAmount: number;
  billDate: string;

  categoryId?: number | null;

  splitType: string;

  paidBy?: string | null;

  createdAt?: string;
  updatedAt?: string;

  participants: SplitBillParticipant[];
}