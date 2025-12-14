import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AuditActionType = 
  | 'view_user_data'
  | 'approve_request'
  | 'reject_request'
  | 'create_product'
  | 'update_product'
  | 'delete_product'
  | 'view_requests'
  | 'view_products'
  | 'view_users'
  | 'view_metrics'
  | 'suspend_user'
  | 'activate_user';

interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  target_user_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export function useLogAuditAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action_type,
      target_table,
      target_id,
      target_user_id,
      details = {},
    }: {
      action_type: AuditActionType;
      target_table?: string;
      target_id?: string;
      target_user_id?: string;
      details?: Record<string, string | number | boolean | null>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('admin_audit_logs')
        .insert([{
          admin_user_id: user.id,
          action_type,
          target_table: target_table || null,
          target_id: target_id || null,
          target_user_id: target_user_id || null,
          details,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useAuditLogs(limit = 50) {
  return useQuery({
    queryKey: ['audit-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as AuditLogEntry[];
    },
  });
}
