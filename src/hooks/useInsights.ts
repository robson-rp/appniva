import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Insight = Database['public']['Tables']['insights']['Row'];

export function useInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['insights', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Insight[];
    },
    enabled: !!user,
  });
}

export function useUnreadInsightsCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['insights', 'unread-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('insights')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

export function useMarkInsightAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('insights')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useMarkAllInsightsAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('insights')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast.success('Todos os insights marcados como lidos');
    },
  });
}

export function useGenerateInsights() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Não autenticado');

      const currentMonth = new Date().toISOString().slice(0, 7);
      const startDate = `${currentMonth}-01`;
      const [year, monthNum] = currentMonth.split('-').map(Number);
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${currentMonth}-${lastDay}`;

      // Get current month expenses
      const { data: currentExpenses } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      const totalExpenses = (currentExpenses || []).reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      // Get current month income
      const { data: currentIncome } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .gte('date', startDate)
        .lte('date', endDate);

      const totalIncome = (currentIncome || []).reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      // Get budget overruns
      const { data: budgets } = await supabase
        .from('budgets')
        .select(`
          amount_limit,
          category:categories(name)
        `)
        .eq('user_id', user.id)
        .eq('month', currentMonth);

      const { data: expensesByCategory } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      const categoryExpenses = (expensesByCategory || []).reduce((acc, t) => {
        if (t.category_id) {
          acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount);
        }
        return acc;
      }, {} as Record<string, number>);

      const insights: Array<{
        user_id: string;
        insight_type: Database['public']['Enums']['insight_type'];
        title: string;
        message: string;
      }> = [];

      // Check for savings opportunity
      const savings = totalIncome - totalExpenses;
      if (savings > 0 && totalIncome > 0 && savings / totalIncome >= 0.1) {
        insights.push({
          user_id: user.id,
          insight_type: 'savings_opportunity',
          title: 'Oportunidade de Poupança',
          message: `Parabéns! Este mês poupaste ${Math.round(
            (savings / totalIncome) * 100
          )}% do teu rendimento. Considera investir parte deste valor num depósito a prazo ou associá-lo a uma meta.`,
        });
      }

      // Check budget overruns
      for (const budget of budgets || []) {
        const budgetId = (budget as any).category?.name;
        if (budgetId) {
          // This is simplified - in real implementation you'd match by category_id
        }
      }

      // Check if expenses are high relative to income
      if (totalIncome > 0 && totalExpenses / totalIncome > 0.9) {
        insights.push({
          user_id: user.id,
          insight_type: 'high_expense',
          title: 'Despesas Elevadas',
          message: `As tuas despesas representam ${Math.round(
            (totalExpenses / totalIncome) * 100
          )}% do teu rendimento este mês. Considera rever os teus gastos nas categorias principais.`,
        });
      }

      if (insights.length > 0) {
        const { error } = await supabase.from('insights').insert(insights);
        if (error) throw error;
      }

      return insights.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      if (count > 0) {
        toast.success(`${count} novo(s) insight(s) gerado(s)`);
      }
    },
    onError: () => {
      toast.error('Erro ao gerar insights');
    },
  });
}
