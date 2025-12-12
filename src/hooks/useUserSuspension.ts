import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLogAuditAction } from './useAuditLog';
import { toast } from 'sonner';

interface SuspendUserParams {
  userId: string;
  userName: string;
  userEmail: string;
  suspend: boolean;
}

export function useUserSuspension() {
  const queryClient = useQueryClient();
  const logAction = useLogAuditAction();

  return useMutation({
    mutationFn: async ({ userId, suspend }: SuspendUserParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: suspend,
          suspended_at: suspend ? new Date().toISOString() : null,
          suspended_by: suspend ? user?.id : null,
        })
        .eq('id', userId);

      if (error) throw error;
      return { userId, suspend };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      
      logAction.mutate({
        action_type: variables.suspend ? 'suspend_user' : 'activate_user',
        target_user_id: variables.userId,
        details: {
          user_name: variables.userName,
          user_email: variables.userEmail,
        },
      });

      toast.success(
        variables.suspend 
          ? 'Utilizador suspenso com sucesso' 
          : 'Utilizador activado com sucesso'
      );
    },
    onError: (error) => {
      console.error('Error updating user suspension:', error);
      toast.error('Erro ao actualizar estado do utilizador');
    },
  });
}
