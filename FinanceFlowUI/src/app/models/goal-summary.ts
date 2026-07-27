export interface GoalSummary {
  goalId: number;
  goalName: string;
  targetAmount: number;
  savedAmount: number;
  remainingAmount: number;
  progress: number;
  daysLeft: number;
  completed: boolean;
  goalColor?: string;
}