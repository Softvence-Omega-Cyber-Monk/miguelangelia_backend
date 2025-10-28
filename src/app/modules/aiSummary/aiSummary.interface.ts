export interface IAIUsage  {
  userId: string;
  totalApiCalls: number;
  monthlyCost: number;
  tokenUsed: number;
  tokenLeft: number;
}