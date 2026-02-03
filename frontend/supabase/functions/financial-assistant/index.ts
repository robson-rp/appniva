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
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, conversationHistory = [] } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
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

    // Fetch all user financial data in parallel
    const [
      profileResult,
      accountsResult,
      transactionsResult,
      debtsResult,
      investmentsResult,
      goalsResult,
      budgetsResult,
      insightsResult,
      scoreResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("accounts").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*, category:categories(name), account:accounts(name)").eq("user_id", userId).order("date", { ascending: false }).limit(100),
      supabase.from("debts").select("*").eq("user_id", userId),
      supabase.from("investments").select("*").eq("user_id", userId),
      supabase.from("goals").select("*").eq("user_id", userId),
      supabase.from("budgets").select("*, category:categories(name)").eq("user_id", userId),
      supabase.from("insights").select("*").eq("user_id", userId).order("generated_at", { ascending: false }).limit(10),
      supabase.from("financial_scores").select("*").eq("user_id", userId).order("generated_at", { ascending: false }).limit(1),
    ]);

    const profile = profileResult.data;
    const accounts = accountsResult.data || [];
    const transactions = transactionsResult.data || [];
    const debts = debtsResult.data || [];
    const investments = investmentsResult.data || [];
    const goals = goalsResult.data || [];
    const budgets = budgetsResult.data || [];
    const insights = insightsResult.data || [];
    const latestScore = scoreResult.data?.[0];

    // Calculate financial summaries
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);
    const monthStart = `${currentMonth}-01`;
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const monthlyTransactions = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
    const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.current_balance), 0);
    const totalInvestments = investments.reduce((sum, i) => sum + Number(i.principal_amount), 0);
    const totalDebt = debts.filter(d => d.status === 'active').reduce((sum, d) => sum + Number(d.current_balance), 0);
    const netWorth = totalBalance + totalInvestments - totalDebt;

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    monthlyTransactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category?.name || 'Outros';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(t.amount);
    });

    // Build context for AI
    const financialContext = `
## DADOS FINANCEIROS DO USUÁRIO

### Perfil
- Nome: ${profile?.name || 'Usuário'}
- Rendimento Mensal Declarado: ${profile?.monthly_income ? formatCurrency(profile.monthly_income) : 'Não informado'}
- Moeda Principal: ${profile?.primary_currency || 'AOA'}

### Resumo Patrimonial
- Saldo Total em Contas: ${formatCurrency(totalBalance)}
- Total Investido: ${formatCurrency(totalInvestments)}
- Dívidas Ativas: ${formatCurrency(totalDebt)}
- Património Líquido: ${formatCurrency(netWorth)}

### Resumo do Mês Atual (${currentMonth})
- Receitas: ${formatCurrency(monthlyIncome)}
- Despesas: ${formatCurrency(monthlyExpenses)}
- Saldo do Mês: ${formatCurrency(monthlyIncome - monthlyExpenses)}
- Taxa de Poupança: ${monthlyIncome > 0 ? ((1 - monthlyExpenses / monthlyIncome) * 100).toFixed(1) : 0}%

### Despesas por Categoria (Mês Atual)
${Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).map(([cat, val]) => `- ${cat}: ${formatCurrency(val)}`).join('\n') || '- Nenhuma despesa registada'}

### Contas Bancárias
${accounts.map(a => `- ${a.name} (${a.institution_name || 'Sem instituição'}): ${formatCurrency(a.current_balance)}`).join('\n') || '- Nenhuma conta'}

### Dívidas Ativas
${debts.filter(d => d.status === 'active').map(d => `- ${d.name}: Saldo ${formatCurrency(d.current_balance)}, Prestação ${formatCurrency(d.installment_amount)}/mês, Taxa ${d.interest_rate_annual}%`).join('\n') || '- Sem dívidas ativas'}

### Investimentos
${investments.map(i => `- ${i.name} (${i.investment_type}): ${formatCurrency(i.principal_amount)}`).join('\n') || '- Sem investimentos'}

### Metas Financeiras
${goals.map(g => `- ${g.name}: ${formatCurrency(g.current_saved_amount || 0)} de ${formatCurrency(g.target_amount)} (${g.target_date ? `Meta: ${g.target_date}` : 'Sem data'})`).join('\n') || '- Sem metas'}

### Orçamentos
${budgets.filter(b => b.month === currentMonth).map(b => `- ${b.category?.name}: Limite ${formatCurrency(b.amount_limit)}`).join('\n') || '- Sem orçamentos definidos'}

### Score Financeiro
${latestScore ? `Score: ${latestScore.score}/100 (calculado em ${latestScore.generated_at})` : 'Ainda não calculado'}

### Insights Recentes
${insights.slice(0, 5).map(i => `- ${i.title}: ${i.message}`).join('\n') || '- Sem insights'}

### Últimas 10 Transações
${transactions.slice(0, 10).map(t => `- ${t.date}: ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)} - ${t.description || t.category?.name || 'Sem descrição'} (${t.account?.name})`).join('\n') || '- Sem transações'}
`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `Você é um assistente financeiro pessoal inteligente chamado "FinAssist". Você tem acesso completo aos dados financeiros do usuário e deve responder de forma:

1. PERSONALIZADA - Use os dados reais do usuário para dar respostas específicas
2. PRÁTICA - Dê conselhos acionáveis e específicos
3. EDUCATIVA - Explique conceitos quando relevante
4. EMPÁTICA - Entenda o contexto do usuário

REGRAS:
- Sempre use os dados fornecidos para embasar suas respostas
- Formate valores monetários adequadamente (ex: 1.500.000 Kz)
- Se não tiver dados suficientes, informe o que o usuário precisa registar
- Seja conciso mas completo
- Use português de Portugal/Angola
- Não invente dados - use apenas o que está disponível

${financialContext}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione créditos à sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in financial-assistant:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function formatCurrency(value: number, currency = 'AOA'): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
