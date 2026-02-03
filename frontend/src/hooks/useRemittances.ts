import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Remittance {
  id: string;
  user_id: string;
  sender_name: string;
  sender_country: string;
  recipient_name: string;
  recipient_phone: string | null;
  amount_sent: number;
  currency_from: string;
  amount_received: number;
  currency_to: string;
  exchange_rate: number;
  service_provider: string;
  fee: number;
  transfer_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const REMITTANCE_PROVIDERS = [
  'Western Union',
  'MoneyGram',
  'Ria Money Transfer',
  'WorldRemit',
  'Remitly',
  'Wise (TransferWise)',
  'PayPal',
  'Banco Directo',
  'Multicaixa',
  'Outro',
] as const;

export const COMMON_COUNTRIES = [
  { code: 'PT', name: 'Portugal' },
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'FR', name: 'França' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'ZA', name: 'África do Sul' },
  { code: 'NA', name: 'Namíbia' },
  { code: 'CD', name: 'RD Congo' },
  { code: 'CG', name: 'Congo' },
  { code: 'AO', name: 'Angola' },
] as const;

export function useRemittances() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['remittances', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remittances')
        .select('*')
        .eq('user_id', user!.id)
        .order('transfer_date', { ascending: false });
      
      if (error) throw error;
      return data as Remittance[];
    },
    enabled: !!user,
  });
}

export function useRemittanceStats() {
  const { data: remittances = [] } = useRemittances();
  
  const totalReceived = remittances
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.amount_received, 0);
  
  const totalFees = remittances
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.fee, 0);
  
  const byProvider = remittances.reduce((acc, r) => {
    acc[r.service_provider] = (acc[r.service_provider] || 0) + r.amount_received;
    return acc;
  }, {} as Record<string, number>);
  
  const byCountry = remittances.reduce((acc, r) => {
    acc[r.sender_country] = (acc[r.sender_country] || 0) + r.amount_received;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalReceived,
    totalFees,
    byProvider,
    byCountry,
    count: remittances.length,
  };
}

export function useCreateRemittance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { 
      remittance: Omit<Remittance, 'id' | 'user_id' | 'created_at' | 'updated_at'>; 
      accountId?: string;
    }) => {
      const { data: remittance, error } = await supabase
        .from('remittances')
        .insert({ ...data.remittance, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create income transaction if account is provided
      if (data.accountId && data.remittance.status === 'completed') {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user!.id,
            account_id: data.accountId,
            type: 'income',
            amount: data.remittance.amount_received,
            currency: data.remittance.currency_to,
            date: data.remittance.transfer_date,
            description: `Remessa de ${data.remittance.sender_name} (${data.remittance.sender_country})`,
            source: 'remittance',
          });
        
        if (transactionError) {
          console.error('Failed to create transaction:', transactionError);
        }
      }
      
      return remittance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remittances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Remessa registada', description: 'A remessa foi registada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível registar a remessa.', variant: 'destructive' });
    },
  });
}

export function useUpdateRemittance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Remittance> & { id: string }) => {
      const { error } = await supabase
        .from('remittances')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remittances'] });
      toast({ title: 'Remessa atualizada', description: 'A remessa foi atualizada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível atualizar a remessa.', variant: 'destructive' });
    },
  });
}

export function useDeleteRemittance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('remittances')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remittances'] });
      toast({ title: 'Remessa eliminada', description: 'A remessa foi eliminada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível eliminar a remessa.', variant: 'destructive' });
    },
  });
}
