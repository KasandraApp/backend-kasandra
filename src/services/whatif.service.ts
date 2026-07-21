import { whatIfSimulateSchema } from '../schemas/whatif.schema';
import { ok, fail } from '../utils/response';
import { projectCash, applyWhatIfParameters, classifySimulationScenario } from '../utils/calculation';
import { DEFAULT_HORIZON_DAYS } from '../config/constants';
import { generateScenarioName } from '../utils/scenario-name';
import { scenarioRepository } from '../repositories/scenario.repository';

export const whatIfService = {
  simulate: async (businessProfileId: string, input: unknown) => {
    const parsed = whatIfSimulateSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: 'Invalid what-if payload', errors: parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) };
    }

    const currentBalance = 0;
    const baselineIncome = 1800000;
    const baselineExpense = 1000000;
    const values = applyWhatIfParameters(baselineIncome, baselineExpense, {
      expenseIncreasePercentage: parsed.data.parameters?.expense_increase_percentage ?? 0,
      incomeDecreasePercentage: parsed.data.parameters?.income_decrease_percentage ?? 0,
      avgDailyIncome: parsed.data.parameters?.avg_daily_income,
      avgDailyExpense: parsed.data.parameters?.avg_daily_expense,
    });
    const projection = projectCash({ currentBalance, avgDailyIncome: values.avgDailyIncome, avgDailyExpense: values.avgDailyExpense, horizonDays: DEFAULT_HORIZON_DAYS });
    const scenario = classifySimulationScenario(projection[DEFAULT_HORIZON_DAYS].value, currentBalance);
    const scenarioName = generateScenarioName({
      expenseIncreasePercentage: parsed.data.parameters?.expense_increase_percentage ?? 0,
      incomeDecreasePercentage: parsed.data.parameters?.income_decrease_percentage ?? 0,
    });
    const result = {
      scenario_name: scenarioName,
      scenario_label: scenario.label,
      estimated_cash_h30: projection[DEFAULT_HORIZON_DAYS].value,
      diff_from_baseline: scenario.delta,
      cash_projection: projection.map((point) => ({ day: point.day, label: point.label, value: point.value })),
    };

    try {
      const persisted = await scenarioRepository.create({
        businessProfileId,
        scenarioName,
        parameterJson: parsed.data,
        resultJson: result,
      });
      return ok({ ...result, scenario_id: String(persisted.id) }, 'Skenario berhasil disimpan');
    } catch (error) {
      return fail('Database unavailable while saving the scenario', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },

  history: async (businessProfileId: string) => {
    try {
      const scenarios = await scenarioRepository.findAll(businessProfileId);
      return ok({
        scenarios: scenarios.map((scenario) => {
          const resultJson = scenario.resultJson as Record<string, unknown>;
          return {
            id: scenario.id,
            scenario_name: scenario.scenarioName,
            estimated_cash_h30: resultJson.estimated_cash_h30,
            created_at: scenario.createdAt,
          };
        }),
      });
    } catch (error) {
      return fail('Database unavailable while loading scenarios', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },

  getById: async (businessProfileId: string, id: string) => {
    try {
      const scenario = await scenarioRepository.findById(id, businessProfileId);
      if (!scenario) return fail('Scenario not found');
      return ok({
        id: scenario.id,
        scenario_name: scenario.scenarioName,
        parameter_json: scenario.parameterJson,
        result_json: scenario.resultJson,
        created_at: scenario.createdAt,
      });
    } catch (error) {
      return fail('Database unavailable while loading the scenario', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },

  delete: async (businessProfileId: string, id: string) => {
    try {
      const deleted = await scenarioRepository.delete(id, businessProfileId);
      if (!deleted) return fail('Scenario not found');
      return ok({}, 'Skenario berhasil dihapus');
    } catch (error) {
      return fail('Database unavailable while deleting the scenario', [{ field: 'database', message: error instanceof Error ? error.message : 'Unknown database error' }]);
    }
  },
};
