export interface SavingGoal {
  goalId: number;
  userId: number;
  goalName: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  goalColor?: string;
}