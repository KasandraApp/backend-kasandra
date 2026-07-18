export function generateScenarioName(params) {
    const expenseIncrease = params.expenseIncreasePercentage ?? 0;
    const incomeDecrease = params.incomeDecreasePercentage ?? 0;
    return `Pengeluaran naik ${expenseIncrease}%, Pemasukan turun ${incomeDecrease}%`;
}
