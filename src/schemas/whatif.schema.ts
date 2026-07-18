import { z } from 'zod';

export const whatIfSimulateSchema = z
  .object({
    scenario_name: z.string().min(1).max(255).optional(),
    expense_increase_pct: z.number().min(0).max(100).optional(),
    income_decrease_pct: z.number().min(0).max(100).optional(),
    avg_income_per_day: z.number().min(0).optional(),
    avg_expense_per_day: z.number().min(0).optional(),
    parameters: z
      .object({
        expense_increase_percentage: z.number().min(0).max(100).optional(),
        income_decrease_percentage: z.number().min(0).max(100).optional(),
        avg_daily_income: z.number().min(0).optional(),
        avg_daily_expense: z.number().min(0).optional(),
      })
      .optional(),
  })
  .transform((value) => ({
    ...value,
    parameters: {
      expense_increase_percentage: value.expense_increase_pct ?? value.parameters?.expense_increase_percentage ?? 0,
      income_decrease_percentage: value.income_decrease_pct ?? value.parameters?.income_decrease_percentage ?? 0,
      avg_daily_income: value.avg_income_per_day ?? value.parameters?.avg_daily_income,
      avg_daily_expense: value.avg_expense_per_day ?? value.parameters?.avg_daily_expense,
    },
  }));

export const whatIfResetSchema = z.object({}).optional();
