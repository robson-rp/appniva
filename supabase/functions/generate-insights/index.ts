import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's financial data
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [year, monthNum] = currentMonth.split("-").map(Number);
    const startDate = `${currentMonth}-01`;
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endDate = `${currentMonth}-${lastDay}`;

    // Get transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*, category:categories(name)")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    // Get accounts
    const { data: accounts } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Get budgets with spending
    const { data: budgets } = await supabase
      .from("budgets")
      .select("*, category:categories(name)")
      .eq("user_id", user.id)
      .eq("month", currentMonth);

    // Get active goals
    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "in_progress");

    // Get investments
    const { data: investments } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", user.id);

    // Calculate summary stats
    const income = (transactions || [])
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const expenses = (transactions || [])
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const expensesByCategory: Record<string, number> = {};
    for (const t of (transactions || []).filter((t: any) => t.type === "expense")) {
      const catName = (t as any).category?.name || "Sem categoria";
      expensesByCategory[catName] = (expensesByCategory[catName] || 0) + Number(t.amount);
    }

    const budgetStatus = (budgets || []).map((b: any) => {
      const catName = b.category?.name || "Desconhecida";
      const spent = expensesByCategory[catName] || 0;
      const limit = Number(b.amount_limit);
      return { category: catName, limit, spent, percentage: limit > 0 ? (spent / limit) * 100 : 0 };
    });

    const totalBalance = (accounts || []).reduce((sum: number, a: any) => sum + Number(a.current_balance), 0);
    const totalInvestments = (investments || []).reduce((sum: number, i: any) => sum + Number(i.principal_amount), 0);
    const totalGoalsSaved = (goals || []).reduce((sum: number, g: any) => sum + Number(g.current_saved_amount), 0);
    const totalGoalsTarget = (goals || []).reduce((sum: number, g: any) => sum + Number(g.target_amount), 0);

    const financialSummary = {
      currentMonth,
      income,
      expenses,
      savings: income - expenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      totalBalance,
      totalInvestments,
      goalsProgress: totalGoalsTarget > 0 ? (totalGoalsSaved / totalGoalsTarget) * 100 : 0,
      expensesByCategory,
      budgetStatus,
      accountsCount: (accounts || []).length,
      activeGoalsCount: (goals || []).length,
    };

    // Call AI to generate insights
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = `És um consultor financeiro pessoal especializado em finanças angolanas. 
Analisa os dados financeiros do utilizador e gera insights personalizados, práticos e accionáveis.

Gera entre 2 a 5 insights baseados nos dados. Cada insight deve ser:
- Específico e baseado nos números reais
- Accionável com sugestões concretas
- Em português de Portugal (não brasileiro)

Tipos de insights disponíveis:
- savings_opportunity: quando há oportunidade de poupar mais
- budget_alert: quando um orçamento está próximo ou ultrapassou o limite
- high_expense: quando uma categoria de despesa é muito alta
- goal_reminder: lembrete sobre metas financeiras
- investment_tip: sugestão sobre investimentos
- general: dicas gerais de saúde financeira`;

    const userPrompt = `Dados financeiros do mês ${currentMonth}:
- Rendimento: ${income.toFixed(2)} AOA
- Despesas: ${expenses.toFixed(2)} AOA
- Poupança: ${financialSummary.savings.toFixed(2)} AOA (${financialSummary.savingsRate.toFixed(1)}%)
- Saldo total em contas: ${totalBalance.toFixed(2)} AOA
- Total investido: ${totalInvestments.toFixed(2)} AOA
- Progresso das metas: ${financialSummary.goalsProgress.toFixed(1)}%
- Metas activas: ${financialSummary.activeGoalsCount}

Despesas por categoria:
${Object.entries(expensesByCategory).map(([cat, amt]) => `- ${cat}: ${(amt as number).toFixed(2)} AOA`).join("\n")}

Estado dos orçamentos:
${budgetStatus.map((b: any) => `- ${b.category}: ${b.spent.toFixed(2)}/${b.limit.toFixed(2)} AOA (${b.percentage.toFixed(0)}%)`).join("\n") || "Nenhum orçamento definido"}

Gera insights relevantes para esta situação financeira.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_insights",
              description: "Gera uma lista de insights financeiros personalizados",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        insight_type: {
                          type: "string",
                          enum: ["savings_opportunity", "budget_alert", "high_expense", "goal_reminder", "investment_tip", "general"],
                        },
                        title: { type: "string", description: "Título curto e impactante (máximo 50 caracteres)" },
                        message: { type: "string", description: "Mensagem detalhada com análise e sugestões (100-200 palavras)" },
                      },
                      required: ["insight_type", "title", "message"],
                    },
                  },
                },
                required: ["insights"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_insights" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de pedidos excedido. Tenta novamente mais tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("Resposta de IA inválida");
    }

    const generatedInsights = JSON.parse(toolCall.function.arguments);
    const insights = generatedInsights.insights || [];

    // Save insights to database
    if (insights.length > 0) {
      const insightsToInsert = insights.map((insight: any) => ({
        user_id: user.id,
        insight_type: insight.insight_type,
        title: insight.title,
        message: insight.message,
      }));

      const { error: insertError } = await supabase.from("insights").insert(insightsToInsert);
      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: insights.length,
        insights 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
