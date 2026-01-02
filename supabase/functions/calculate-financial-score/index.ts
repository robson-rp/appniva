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
      goalsResult,
      budgetsResult,
    ] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId),
      supabase.from("debts").select("*").eq("user_id", userId),
      supabase.from("investments").select("*").eq("user_id", userId),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("goals").select("*").eq("user_id", userId),
      supabase.from("budgets").select("*").eq("user_id", userId),
    ]);

    const accounts = accountsResult.data || [];
    const transactions = transactionsResult.data || [];
    const debts = debtsResult.data || [];
    const investments = investmentsResult.data || [];
    const profile = profileResult.data;
    const goals = goalsResult.data || [];
    const budgets = budgetsResult.data || [];

    const criteria: CriteriaScore[] = [];

    // 1. DISCIPLINA DE DESPESAS - 25%
    const disciplineScore = calculateDiscipline(transactions);
    criteria.push({
      name: "Disciplina de Despesas",
      score: disciplineScore.score,
      weight: 25,
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

    // 3. NÍVEL DE ENDIVIDAMENTO - 20%
    const debtScore = calculateDebtHealth(debts, profile?.monthly_income);
    criteria.push({
      name: "Nível de Endividamento",
      score: debtScore.score,
      weight: 20,
      details: debtScore.details,
    });

    // 4. ORGANIZAÇÃO FINANCEIRA - 15%
    const organizationScore = calculateOrganization(accounts, transactions, budgets);
    criteria.push({
      name: "Organização Financeira",
      score: organizationScore.score,
      weight: 15,
      details: organizationScore.details,
    });

    // 5. PLANEAMENTO FUTURO - 15%
    const planningScore = calculatePlanning(goals, investments);
    criteria.push({
      name: "Planeamento Futuro",
      score: planningScore.score,
      weight: 15,
      details: planningScore.details,
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

function calculateOrganization(accounts: any[], transactions: any[], budgets: any[]): { score: number; details: string } {
  let score = 50; // Base score
  const factors: string[] = [];

  // Check if user has multiple accounts (better organization)
  if (accounts.length >= 2) {
    score += 15;
    factors.push(`${accounts.length} contas`);
  } else if (accounts.length === 1) {
    score += 5;
    factors.push("1 conta");
  }

  // Check if transactions have categories
  const categorizedTx = transactions.filter((t) => t.category_id);
  const categorizationRate = transactions.length > 0 
    ? (categorizedTx.length / transactions.length) * 100 
    : 0;
  
  if (categorizationRate >= 80) {
    score += 20;
  } else if (categorizationRate >= 50) {
    score += 10;
  }
  factors.push(`${categorizationRate.toFixed(0)}% categorizado`);

  // Check if user has budgets
  if (budgets.length >= 3) {
    score += 15;
    factors.push(`${budgets.length} orçamentos`);
  } else if (budgets.length >= 1) {
    score += 8;
    factors.push(`${budgets.length} orçamento(s)`);
  }

  return {
    score: Math.min(100, Math.round(score)),
    details: factors.join(", ") || "Sem dados de organização",
  };
}

function calculatePlanning(goals: any[], investments: any[]): { score: number; details: string } {
  let score = 30; // Base score
  const factors: string[] = [];

  // Check if user has active goals
  const activeGoals = goals.filter((g) => g.status === "in_progress");
  if (activeGoals.length >= 2) {
    score += 25;
    factors.push(`${activeGoals.length} metas ativas`);
  } else if (activeGoals.length === 1) {
    score += 15;
    factors.push("1 meta ativa");
  }

  // Check goal progress
  const goalProgress = activeGoals.reduce((acc, g) => {
    const progress = g.target_amount > 0 
      ? (Number(g.current_saved_amount || 0) / Number(g.target_amount)) * 100 
      : 0;
    return acc + progress;
  }, 0) / (activeGoals.length || 1);
  
  if (goalProgress >= 50) {
    score += 15;
  } else if (goalProgress >= 25) {
    score += 8;
  }

  // Check if user has investments (long-term planning)
  if (investments.length >= 2) {
    score += 20;
    factors.push(`${investments.length} investimentos`);
  } else if (investments.length === 1) {
    score += 10;
    factors.push("1 investimento");
  }

  // Check for goals with target dates (better planning)
  const goalsWithDates = activeGoals.filter((g) => g.target_date);
  if (goalsWithDates.length > 0) {
    score += 10;
  }

  return {
    score: Math.min(100, Math.round(score)),
    details: factors.length > 0 ? factors.join(", ") : "Sem planeamento definido",
  };
}
