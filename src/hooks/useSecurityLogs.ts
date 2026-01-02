import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityLog {
  id: string;
  user_id: string;
  action: string;
  ip_address: string | null;
  device_info: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export function useSecurityLogs(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['security-logs', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SecurityLog[];
    },
    enabled: !!user,
  });
}

export function useLogSecurityAction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      action,
      details = {},
    }: {
      action: string;
      details?: Record<string, string | number | boolean | null>;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get device info
      const deviceInfo = navigator.userAgent;

      const { error } = await supabase
        .from('security_logs')
        .insert([{
          user_id: user.id,
          action,
          device_info: deviceInfo,
          details,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-logs'] });
    },
  });
}
