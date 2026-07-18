export function generateScenarioName(params: {
  expenseIncreasePercentage?: number;
  incomeDecreasePercentage?: number;
}): string {
  const expenseIncrease = params.expenseIncreasePercentage ?? 0;
  const incomeDecrease = params.incomeDecreasePercentage ?? 0;

  return `Pengeluaran naik ${expenseIncrease}%, Pemasukan turun ${incomeDecrease}%`;
}
