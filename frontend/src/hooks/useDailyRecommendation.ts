import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays, parseISO } from 'date-fns';

type Priority = 'low' | 'medium' | 'high';

interface DailyRecommendation {
  id: string;
  user_id: string;
  title: string;
  message: string;
  action_label: string;
  action_route: string;
  priority: Priority;
  generated_at: string;
  created_at: string;
}

interface RecommendationInput {
  title: string;
  message: string;
  action_label: string;
  action_route: string;
  priority: Priority;
}

// Helper to generate recommendation based on financial data
async function generateRecommendation(userId: string): Promise<RecommendationInput | null> {
  const today = new Date();
  
  // Fetch all relevant financial data in parallel
  const [
    { data: accounts },
    { data: debts },
    { data: goals },
    { data: budgets },
    { data: transactions },
    { data: subscriptions },
  ] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', userId).eq('is_active', true),
    supabase.from('debts').select('*').eq('user_id', userId).eq('status', 'active' as any),
    supabase.from('goals').select('*').eq('user_id', userId).eq('status', 'active' as any),
    supabase.from('budgets').select('*, categories(name)').eq('user_id', userId).eq('month', format(today, 'yyyy-MM')),
    supabase.from('transactions').select('*').eq('user_id', userId).eq('type', 'expense').gte('date', format(today, 'yyyy-MM-01')),
    supabase.from('subscriptions').select('*').eq('user_id', userId).eq('is_active', true),
  ]);

  // Calculate totals
  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;
  const totalExpenses = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

  // Priority HIGH: Check for critical issues
  
  // 1. Negative balance
  if (totalBalance < 0) {
    return {
      title: 'Atenção Urgente',
      message: 'O teu saldo total está negativo. Revê as tuas despesas.',
      action_label: 'Ver Contas',
      action_route: '/accounts',
      priority: 'high',
    };
  }

  // 2. Debt payment due soon
  if (debts && debts.length > 0) {
    const upcomingDebt = debts.find(d => {
      if (!d.next_payment_date) return false;
      const daysUntil = differenceInDays(parseISO(d.next_payment_date), today);
      return daysUntil >= 0 && daysUntil <= 5;
    });

    if (upcomingDebt) {
      const daysUntil = differenceInDays(parseISO(upcomingDebt.next_payment_date!), today);
      return {
        title: 'Pagamento Próximo',
        message: daysUntil === 0 
          ? `A prestação de "${upcomingDebt.name}" vence hoje.`
          : `A prestação de "${upcomingDebt.name}" vence em ${daysUntil} dia${daysUntil > 1 ? 's' : ''}.`,
        action_label: 'Ver Dívida',
        action_route: '/debts',
        priority: 'high',
      };
    }
  }

  // 3. Budget exceeded
  if (budgets && budgets.length > 0 && transactions) {
    for (const budget of budgets) {
      const categoryExpenses = transactions
        .filter(t => t.category_id === budget.category_id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (categoryExpenses > budget.amount_limit) {
        const categoryName = (budget as any).categories?.name || 'esta categoria';
        return {
          title: 'Orçamento Excedido',
          message: `Ultrapassaste o orçamento de ${categoryName} este mês.`,
          action_label: 'Ver Orçamentos',
          action_route: '/budgets',
          priority: 'high',
        };
      }
    }
  }

  // 4. Subscription renewal soon
  if (subscriptions && subscriptions.length > 0) {
    const upcomingSub = subscriptions.find(s => {
      if (!s.next_renewal_date) return false;
      const daysUntil = differenceInDays(parseISO(s.next_renewal_date), today);
      return daysUntil >= 0 && daysUntil <= 3;
    });

    if (upcomingSub) {
      const daysUntil = differenceInDays(parseISO(upcomingSub.next_renewal_date), today);
      return {
        title: 'Renovação Próxima',
        message: daysUntil === 0
          ? `A subscrição "${upcomingSub.name}" renova hoje.`
          : `A subscrição "${upcomingSub.name}" renova em ${daysUntil} dia${daysUntil > 1 ? 's' : ''}.`,
        action_label: 'Ver Subscrições',
        action_route: '/subscriptions',
        priority: 'high',
      };
    }
  }

  // Priority MEDIUM: Opportunities

  // 5. Goal behind schedule
  if (goals && goals.length > 0) {
    const behindGoal = goals.find(g => {
      if (!g.target_date) return false;
      const daysRemaining = differenceInDays(parseISO(g.target_date), today);
      if (daysRemaining <= 0) return false;
      
      const progress = (g.current_saved_amount || 0) / g.target_amount;
      const timeProgress = 1 - (daysRemaining / 365); // Rough estimate
      return progress < timeProgress * 0.7; // 30% behind expected
    });

    if (behindGoal) {
      return {
        title: 'Meta Atrasada',
        message: `A meta "${behindGoal.name}" está atrás do esperado. Contribui hoje!`,
        action_label: 'Ver Meta',
        action_route: '/goals',
        priority: 'medium',
      };
    }
  }

  // 6. Savings opportunity (income - expenses > 20% of income)
  const { data: incomeTransactions } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'income')
    .gte('date', format(today, 'yyyy-MM-01'));

  const totalIncome = incomeTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const savingsAmount = totalIncome - totalExpenses;

  if (totalIncome > 0 && savingsAmount > totalIncome * 0.2) {
    return {
      title: 'Oportunidade de Poupança',
      message: `Podes poupar ${Math.round(savingsAmount).toLocaleString()} Kz este mês!`,
      action_label: 'Criar Meta',
      action_route: '/goals',
      priority: 'medium',
    };
  }

  // 7. Budget close to limit (>80%)
  if (budgets && budgets.length > 0 && transactions) {
    for (const budget of budgets) {
      const categoryExpenses = transactions
        .filter(t => t.category_id === budget.category_id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = categoryExpenses / budget.amount_limit;
      if (percentage >= 0.8 && percentage < 1) {
        const categoryName = (budget as any).categories?.name || 'esta categoria';
        return {
          title: 'Orçamento Quase no Limite',
          message: `Usaste ${Math.round(percentage * 100)}% do orçamento de ${categoryName}.`,
          action_label: 'Ver Orçamentos',
          action_route: '/budgets',
          priority: 'medium',
        };
      }
    }
  }

  // Priority LOW: Tips and education

  // 8. No goals set
  if (!goals || goals.length === 0) {
    return {
      title: 'Define uma Meta',
      message: 'Ter metas financeiras ajuda a poupar com propósito.',
      action_label: 'Criar Meta',
      action_route: '/goals',
      priority: 'low',
    };
  }

  // 9. No budgets set
  if (!budgets || budgets.length === 0) {
    return {
      title: 'Cria um Orçamento',
      message: 'Controlar gastos é o primeiro passo para poupar.',
      action_label: 'Criar Orçamento',
      action_route: '/budgets',
      priority: 'low',
    };
  }

  // 10. Check financial health score
  return {
    title: 'Vê o Teu Score',
    message: 'Descobre como está a tua saúde financeira.',
    action_label: 'Ver Score',
    action_route: '/score',
    priority: 'low',
  };
}

export function useDailyRecommendation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const query = useQuery({
    queryKey: ['daily-recommendation', user?.id, today],
    queryFn: async () => {
      if (!user) return null;

      // Check if we already have a recommendation for today
      const { data: existing, error } = await supabase
        .from('daily_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('generated_at', today)
        .maybeSingle();

      if (error) throw error;

      if (existing) {
        return existing as DailyRecommendation;
      }

      // Generate new recommendation
      const recommendation = await generateRecommendation(user.id);
      
      if (!recommendation) return null;

      // Save to database
      const { data: newRec, error: insertError } = await supabase
        .from('daily_recommendations')
        .insert([{
          user_id: user.id,
          ...recommendation,
          generated_at: today,
        }])
        .select()
        .single();

      if (insertError) {
        // If duplicate key, fetch the existing one
        if (insertError.code === '23505') {
          const { data: existingRec } = await supabase
            .from('daily_recommendations')
            .select('*')
            .eq('user_id', user.id)
            .eq('generated_at', today)
            .single();
          return existingRec as DailyRecommendation;
        }
        throw insertError;
      }

      return newRec as DailyRecommendation;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const refresh = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Delete today's recommendation
      await supabase
        .from('daily_recommendations')
        .delete()
        .eq('user_id', user.id)
        .eq('generated_at', today);

      // Generate new one
      const recommendation = await generateRecommendation(user.id);
      if (!recommendation) return null;

      const { data, error } = await supabase
        .from('daily_recommendations')
        .insert([{
          user_id: user.id,
          ...recommendation,
          generated_at: today,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as DailyRecommendation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-recommendation'] });
    },
  });

  return {
    recommendation: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refresh: refresh.mutate,
    isRefreshing: refresh.isPending,
  };
}
