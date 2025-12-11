import { FutureExpense } from '@/hooks/useScenarios';

export interface SimulationParams {
  initialWealth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  salaryIncreaseRate: number; // annual %
  investmentReturnRate: number; // annual %
  inflationRate: number; // annual %
  timeHorizonYears: number;
  futureExpenses: FutureExpense[];
  goals: { name: string; amount: number }[];
}

export interface MonthlyProjection {
  month: number;
  year: number;
  date: Date;
  income: number;
  expenses: number;
  savings: number;
  investmentGains: number;
  wealth: number;
  realWealth: number; // adjusted for inflation
  savingsRate: number;
}

export interface GoalProjection {
  name: string;
  targetAmount: number;
  reachedMonth: number | null;
  reachedDate: Date | null;
}

export interface SimulationResult {
  projections: MonthlyProjection[];
  goalProjections: GoalProjection[];
  breakEvenMonth: number | null;
  breakEvenDate: Date | null;
  recommendedSavingsRate: number;
  finalWealth: number;
  finalRealWealth: number;
  totalSaved: number;
  totalInvestmentGains: number;
}

export function runSimulation(params: SimulationParams): SimulationResult {
  const {
    initialWealth,
    monthlyIncome,
    monthlyExpense,
    salaryIncreaseRate,
    investmentReturnRate,
    inflationRate,
    timeHorizonYears,
    futureExpenses,
    goals,
  } = params;

  const totalMonths = timeHorizonYears * 12;
  const projections: MonthlyProjection[] = [];
  const goalProjections: GoalProjection[] = goals.map(g => ({
    name: g.name,
    targetAmount: g.amount,
    reachedMonth: null,
    reachedDate: null,
  }));

  // Monthly rates
  const monthlyInflationRate = Math.pow(1 + inflationRate / 100, 1 / 12) - 1;
  const monthlyInvestmentRate = Math.pow(1 + investmentReturnRate / 100, 1 / 12) - 1;
  const monthlySalaryIncreaseRate = Math.pow(1 + salaryIncreaseRate / 100, 1 / 12) - 1;

  let currentWealth = initialWealth;
  let currentIncome = monthlyIncome;
  let currentExpense = monthlyExpense;
  let cumulativeInflation = 1;
  let totalSaved = 0;
  let totalInvestmentGains = 0;
  let breakEvenMonth: number | null = null;

  const startDate = new Date();

  for (let month = 1; month <= totalMonths; month++) {
    // Apply salary increase
    currentIncome = currentIncome * (1 + monthlySalaryIncreaseRate);
    
    // Apply inflation to expenses
    currentExpense = currentExpense * (1 + monthlyInflationRate);
    cumulativeInflation *= (1 + monthlyInflationRate);

    // Check for one-time future expenses
    const futureExpenseThisMonth = futureExpenses
      .filter(fe => fe.month === month)
      .reduce((sum, fe) => sum + fe.amount, 0);

    const totalExpenses = currentExpense + futureExpenseThisMonth;

    // Calculate savings
    const monthlySavings = currentIncome - totalExpenses;
    totalSaved += Math.max(0, monthlySavings);

    // Apply investment returns to existing wealth
    const investmentGains = currentWealth * monthlyInvestmentRate;
    totalInvestmentGains += investmentGains;

    // Update wealth
    currentWealth = currentWealth + investmentGains + monthlySavings;

    // Check for break-even (first negative cashflow)
    if (breakEvenMonth === null && monthlySavings < 0) {
      breakEvenMonth = month;
    }

    // Calculate real wealth (adjusted for inflation)
    const realWealth = currentWealth / cumulativeInflation;

    // Savings rate
    const savingsRate = currentIncome > 0 ? (monthlySavings / currentIncome) * 100 : 0;

    // Calculate date
    const projectionDate = new Date(startDate);
    projectionDate.setMonth(projectionDate.getMonth() + month);

    const projection: MonthlyProjection = {
      month,
      year: Math.ceil(month / 12),
      date: projectionDate,
      income: currentIncome,
      expenses: totalExpenses,
      savings: monthlySavings,
      investmentGains,
      wealth: currentWealth,
      realWealth,
      savingsRate,
    };

    projections.push(projection);

    // Check if goals are reached
    for (const gp of goalProjections) {
      if (gp.reachedMonth === null && currentWealth >= gp.targetAmount) {
        gp.reachedMonth = month;
        gp.reachedDate = projectionDate;
      }
    }
  }

  // Calculate recommended savings rate
  // Target: have 20% buffer above expenses at end of horizon
  const finalMonthlyExpense = projections[projections.length - 1]?.expenses || monthlyExpense;
  const targetEmergencyFund = finalMonthlyExpense * 6; // 6 months expenses
  const currentSavingsRate = monthlyIncome > 0 
    ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 
    : 0;
  
  // Simple heuristic: if final wealth < target, recommend higher savings
  const recommendedSavingsRate = Math.min(
    50,
    Math.max(
      10,
      currentWealth < targetEmergencyFund 
        ? currentSavingsRate + 10 
        : currentSavingsRate
    )
  );

  return {
    projections,
    goalProjections,
    breakEvenMonth,
    breakEvenDate: breakEvenMonth 
      ? projections.find(p => p.month === breakEvenMonth)?.date || null 
      : null,
    recommendedSavingsRate,
    finalWealth: currentWealth,
    finalRealWealth: projections[projections.length - 1]?.realWealth || 0,
    totalSaved,
    totalInvestmentGains,
  };
}
