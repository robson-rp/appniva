import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CriteriaScore {
  name: string;
  score: number;
  weight: number;
  details: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Fetch user data in parallel
    const [
      accountsResult,
      transactionsResult,
      debtsResult,
      investmentsResult,
      profileResult,
    ] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId),
      supabase.from("debts").select("*").eq("user_id", userId),
      supabase.from("investments").select("*").eq("user_id", userId),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ]);

    const accounts = accountsResult.data || [];
    const transactions = transactionsResult.data || [];
    const debts = debtsResult.data || [];
    const investments = investmentsResult.data || [];
    const profile = profileResult.data;

    const criteria: CriteriaScore[] = [];

    // 1. DISCIPLINA (Consistência de despesas) - 20%
    const disciplineScore = calculateDiscipline(transactions);
    criteria.push({
      name: "Disciplina",
      score: disciplineScore.score,
      weight: 20,
      details: disciplineScore.details,
    });

    // 2. TAXA DE POUPANÇA - 25%
    const savingsScore = calculateSavingsRate(transactions, profile?.monthly_income);
    criteria.push({
      name: "Taxa de Poupança",
      score: savingsScore.score,
      weight: 25,
      details: savingsScore.details,
    });

    // 3. SAÚDE DAS DÍVIDAS - 25%
    const debtScore = calculateDebtHealth(debts, profile?.monthly_income);
    criteria.push({
      name: "Saúde das Dívidas",
      score: debtScore.score,
      weight: 25,
      details: debtScore.details,
    });

    // 4. DIVERSIFICAÇÃO DE INVESTIMENTOS - 20%
    const diversificationScore = calculateInvestmentDiversification(investments);
    criteria.push({
      name: "Diversificação de Investimentos",
      score: diversificationScore.score,
      weight: 20,
      details: diversificationScore.details,
    });

    // 5. EXPOSIÇÃO CAMBIAL - 10%
    const currencyScore = calculateCurrencyExposure(accounts, investments);
    criteria.push({
      name: "Exposição Cambial",
      score: currencyScore.score,
      weight: 10,
      details: currencyScore.details,
    });

    // Calculate weighted final score
    const totalWeight = criteria.reduce((acc, c) => acc + c.weight, 0);
    const finalScore = Math.round(
      criteria.reduce((acc, c) => acc + (c.score * c.weight), 0) / totalWeight
    );

    // Save to database
    const { data: savedScore, error: saveError } = await supabase
      .from("financial_scores")
      .insert({
        user_id: userId,
        score: finalScore,
        criteria_json: { criteria, generated_at: new Date().toISOString() },
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving score:", saveError);
      throw saveError;
    }

    return new Response(JSON.stringify(savedScore), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error calculating financial score:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calculateDiscipline(transactions: any[]): { score: number; details: string } {
  if (transactions.length < 5) {
    return { score: 50, details: "Dados insuficientes para análise de disciplina" };
  }

  const expenses = transactions.filter((t) => t.type === "expense");
  if (expenses.length < 3) {
    return { score: 50, details: "Poucas despesas para análise" };
  }

  // Group by month
  const monthlyExpenses: Record<string, number> = {};
  expenses.forEach((t) => {
    const month = t.date?.substring(0, 7);
    if (month) {
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + Number(t.amount);
    }
  });

  const months = Object.values(monthlyExpenses);
  if (months.length < 2) {
    return { score: 60, details: "Apenas um mês de dados disponível" };
  }

  // Calculate coefficient of variation (lower = more consistent)
  const avg = months.reduce((a, b) => a + b, 0) / months.length;
  const variance = months.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / months.length;
  const stdDev = Math.sqrt(variance);
  const cv = (stdDev / avg) * 100;

  // CV < 10% = excellent, CV > 50% = poor
  let score = Math.max(0, Math.min(100, 100 - cv * 1.5));
  score = Math.round(score);

  return {
    score,
    details: `Variação mensal de despesas: ${cv.toFixed(1)}%`,
  };
}

function calculateSavingsRate(transactions: any[], monthlyIncome?: number): { score: number; details: string } {
  const last3Months = new Date();
  last3Months.setMonth(last3Months.getMonth() - 3);

  const recentTx = transactions.filter((t) => new Date(t.date) >= last3Months);

  const income = recentTx
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = recentTx
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalIncome = income || (monthlyIncome || 0) * 3;

  if (totalIncome === 0) {
    return { score: 50, details: "Sem dados de rendimento" };
  }

  const savingsRate = ((totalIncome - expense) / totalIncome) * 100;

  // 30%+ = 100 points, 0% = 0 points
  const score = Math.max(0, Math.min(100, Math.round(savingsRate * 3.33)));

  return {
    score,
    details: `Taxa de poupança: ${savingsRate.toFixed(1)}%`,
  };
}

function calculateDebtHealth(debts: any[], monthlyIncome?: number): { score: number; details: string } {
  const activeDebts = debts.filter((d) => d.status === "active");

  if (activeDebts.length === 0) {
    return { score: 100, details: "Sem dívidas ativas - excelente!" };
  }

  const totalDebt = activeDebts.reduce((acc, d) => acc + Number(d.current_balance), 0);
  const totalInstallments = activeDebts.reduce((acc, d) => acc + Number(d.installment_amount), 0);

  const baseIncome = monthlyIncome || 1000000;

  // Debt-to-income ratio (monthly installments vs income)
  const dti = (totalInstallments / baseIncome) * 100;

  // DTI < 30% = excellent, > 50% = critical
  let score = Math.max(0, Math.min(100, 100 - dti * 2));

  // Bonus for low interest rates
  const avgInterest = activeDebts.reduce((acc, d) => acc + Number(d.interest_rate_annual), 0) / activeDebts.length;
  if (avgInterest < 10) score = Math.min(100, score + 10);
  if (avgInterest > 20) score = Math.max(0, score - 10);

  return {
    score: Math.round(score),
    details: `Comprometimento: ${dti.toFixed(1)}% do rendimento`,
  };
}

function calculateInvestmentDiversification(investments: any[]): { score: number; details: string } {
  if (investments.length === 0) {
    return { score: 30, details: "Sem investimentos registados" };
  }

  const types = new Set(investments.map((i) => i.investment_type));
  const typeCount = types.size;

  // Calculate HHI (Herfindahl-Hirschman Index) for concentration
  const totalValue = investments.reduce((acc, i) => acc + Number(i.principal_amount), 0);
  const shares = investments.map((i) => (Number(i.principal_amount) / totalValue) * 100);
  const hhi = shares.reduce((acc, s) => acc + s * s, 0);

  // HHI 10000 = one asset, < 1500 = well diversified
  let score = Math.max(0, Math.min(100, 100 - (hhi / 100)));

  // Bonus for multiple asset types
  if (typeCount >= 4) score = Math.min(100, score + 15);
  else if (typeCount >= 3) score = Math.min(100, score + 10);
  else if (typeCount >= 2) score = Math.min(100, score + 5);

  return {
    score: Math.round(score),
    details: `${typeCount} tipo(s) de investimento, ${investments.length} posição(ões)`,
  };
}

function calculateCurrencyExposure(accounts: any[], investments: any[]): { score: number; details: string } {
  const currencies = new Set<string>();
  let totalValue = 0;
  const currencyValues: Record<string, number> = {};

  accounts.forEach((a) => {
    currencies.add(a.currency);
    currencyValues[a.currency] = (currencyValues[a.currency] || 0) + Number(a.current_balance);
    totalValue += Number(a.current_balance);
  });

  investments.forEach((i) => {
    currencies.add(i.currency);
    currencyValues[i.currency] = (currencyValues[i.currency] || 0) + Number(i.principal_amount);
    totalValue += Number(i.principal_amount);
  });

  if (totalValue === 0 || currencies.size === 0) {
    return { score: 50, details: "Sem dados para análise cambial" };
  }

  // Having some foreign currency exposure is good for hedging
  const aoaPercentage = ((currencyValues["AOA"] || 0) / totalValue) * 100;
  const foreignPercentage = 100 - aoaPercentage;

  // Ideal: 10-30% foreign currency
  let score: number;
  if (foreignPercentage >= 10 && foreignPercentage <= 30) {
    score = 100;
  } else if (foreignPercentage < 10) {
    score = 60 + foreignPercentage * 4; // Up to 100 at 10%
  } else if (foreignPercentage > 30 && foreignPercentage <= 50) {
    score = 100 - (foreignPercentage - 30) * 2;
  } else {
    score = Math.max(30, 60 - (foreignPercentage - 50));
  }

  return {
    score: Math.round(score),
    details: `${foreignPercentage.toFixed(1)}% em moeda estrangeira`,
  };
}
