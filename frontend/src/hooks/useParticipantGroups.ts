import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ParticipantGroup {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ParticipantGroupMember {
  id: string;
  group_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface ParticipantGroupWithMembers extends ParticipantGroup {
  members: ParticipantGroupMember[];
}

export function useParticipantGroups() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['participant-groups', user?.id],
    queryFn: async () => {
      const response = await api.get('participant-groups?per_page=100'); // Get enough for dropdowns
      // The controller returns ParticipantGroupResource collection which includes members
      return response.data.data as ParticipantGroupWithMembers[];
    },
    enabled: !!user,
  });
}

export function useCreateParticipantGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      members: Array<{ name: string; phone?: string; email?: string }>;
    }) => {
      // Backend expects 'members' array in the payload
      const response = await api.post('participant-groups', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant-groups'] });
      toast.success('Grupo de participantes criado com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar grupo: ' + (error.message || 'Erro desconhecido'));
    },
  });
}

export function useDeleteParticipantGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`participant-groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant-groups'] });
      toast.success('Grupo eliminado com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao eliminar grupo: ' + (error.message || 'Erro desconhecido'));
    },
  });
}
