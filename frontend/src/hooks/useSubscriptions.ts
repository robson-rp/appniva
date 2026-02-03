import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { addDays, differenceInDays } from 'date-fns';

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_renewal_date: string;
  category_id: string | null;
  account_id: string | null;
  is_active: boolean;
  icon: string;
  color: string;
  alert_days_before: number;
  last_alert_sent_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: { name: string; color: string } | null;
  account?: { name: string } | null;
}

export interface SubscriptionInput {
  name: string;
  description?: string | null;
  amount: number;
  currency?: string;
  billing_cycle: BillingCycle;
  next_renewal_date: string;
  category_id?: string | null;
  account_id?: string | null;
  is_active?: boolean;
  icon?: string;
  color?: string;
  alert_days_before?: number;
}

export function useSubscriptions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          category:categories(name, color),
          account:accounts(name)
        `)
        .eq('user_id', user!.id)
        .order('next_renewal_date', { ascending: true });

      if (error) throw error;
      return data as Subscription[];
    },
    enabled: !!user,
  });
}

export function useUpcomingRenewals(daysAhead: number = 7) {
  const { data: subscriptions } = useSubscriptions();
  
  const today = new Date();
  const futureDate = addDays(today, daysAhead);
  
  return subscriptions?.filter((sub) => {
    if (!sub.is_active) return false;
    const renewalDate = new Date(sub.next_renewal_date);
    return renewalDate >= today && renewalDate <= futureDate;
  }) || [];
}

export function useSubscriptionStats() {
  const { data: subscriptions } = useSubscriptions();
  
  const activeSubscriptions = subscriptions?.filter((s) => s.is_active) || [];
  
  const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
    let monthlyAmount = sub.amount;
    switch (sub.billing_cycle) {
      case 'weekly':
        monthlyAmount = sub.amount * 4.33;
        break;
      case 'quarterly':
        monthlyAmount = sub.amount / 3;
        break;
      case 'yearly':
        monthlyAmount = sub.amount / 12;
        break;
    }
    return sum + monthlyAmount;
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  return {
    totalActive: activeSubscriptions.length,
    monthlyTotal,
    yearlyTotal,
  };
}

export function useCreateSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubscriptionInput) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          ...input,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscrição criada com sucesso');
    },
    onError: (error) => {
      console.error('Error creating subscription:', error);
      toast.error('Erro ao criar subscrição');
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<SubscriptionInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscrição actualizada');
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
      toast.error('Erro ao actualizar subscrição');
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscrição eliminada');
    },
    onError: (error) => {
      console.error('Error deleting subscription:', error);
      toast.error('Erro ao eliminar subscrição');
    },
  });
}

export function useToggleSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success(data.is_active ? 'Subscrição reactivada' : 'Subscrição pausada');
    },
    onError: (error) => {
      console.error('Error toggling subscription:', error);
      toast.error('Erro ao alterar estado da subscrição');
    },
  });
}

// Calculate days until renewal
export function getDaysUntilRenewal(nextRenewalDate: string): number {
  return differenceInDays(new Date(nextRenewalDate), new Date());
}

// Calculate next renewal date after current one
export function calculateNextRenewalDate(currentDate: string, billingCycle: BillingCycle): string {
  const date = new Date(currentDate);
  
  switch (billingCycle) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
}
