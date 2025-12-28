import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ExchangeRate {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: number;
  source: string;
  fetched_at: string;
  created_at: string;
}

export interface ExchangeRateAlert {
  id: string;
  user_id: string;
  base_currency: string;
  target_currency: string;
  threshold_rate: number;
  alert_direction: 'above' | 'below';
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('fetched_at', { ascending: false });
      
      if (error) throw error;
      return data as ExchangeRate[];
    },
  });
}

export function useLatestRates() {
  return useQuery({
    queryKey: ['exchange-rates', 'latest'],
    queryFn: async () => {
      // Get latest rate for each currency pair
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('fetched_at', { ascending: false });
      
      if (error) throw error;
      
      // Group by currency pair and get latest
      const latestRates = new Map<string, ExchangeRate>();
      (data as ExchangeRate[]).forEach(rate => {
        const key = `${rate.base_currency}-${rate.target_currency}`;
        if (!latestRates.has(key)) {
          latestRates.set(key, rate);
        }
      });
      
      return Array.from(latestRates.values());
    },
  });
}

export function useExchangeRateAlerts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exchange-rate-alerts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rate_alerts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ExchangeRateAlert[];
    },
    enabled: !!user,
  });
}

export function useCreateExchangeRateAlert() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (alert: Omit<ExchangeRateAlert, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_triggered_at'>) => {
      const { data, error } = await supabase
        .from('exchange_rate_alerts')
        .insert({ ...alert, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rate-alerts'] });
      toast({ title: 'Alerta criado', description: 'O alerta de câmbio foi criado com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível criar o alerta.', variant: 'destructive' });
    },
  });
}

export function useDeleteExchangeRateAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exchange_rate_alerts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rate-alerts'] });
      toast({ title: 'Alerta removido', description: 'O alerta foi removido com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível remover o alerta.', variant: 'destructive' });
    },
  });
}

export function useAddExchangeRate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (rate: { base_currency: string; target_currency: string; rate: number; source?: string }) => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .insert(rate)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
      toast({ title: 'Taxa adicionada', description: 'A taxa de câmbio foi adicionada.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível adicionar a taxa.', variant: 'destructive' });
    },
  });
}

// Utility function to convert amounts
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rates: ExchangeRate[]): number | null {
  if (fromCurrency === toCurrency) return amount;
  
  // Try direct conversion
  const directRate = rates.find(r => r.base_currency === fromCurrency && r.target_currency === toCurrency);
  if (directRate) return amount * directRate.rate;
  
  // Try inverse conversion
  const inverseRate = rates.find(r => r.base_currency === toCurrency && r.target_currency === fromCurrency);
  if (inverseRate) return amount / inverseRate.rate;
  
  // Try via USD
  const toUSD = rates.find(r => r.target_currency === fromCurrency && r.base_currency === 'USD');
  const fromUSD = rates.find(r => r.base_currency === 'USD' && r.target_currency === toCurrency);
  if (toUSD && fromUSD) {
    return (amount / toUSD.rate) * fromUSD.rate;
  }
  
  return null;
}
