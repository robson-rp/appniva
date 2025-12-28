import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
      const { data: groups, error: groupsError } = await supabase
        .from('participant_groups')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');
      
      if (groupsError) throw groupsError;
      
      const groupIds = groups.map(g => g.id);
      if (groupIds.length === 0) return [];
      
      const { data: members, error: membersError } = await supabase
        .from('participant_group_members')
        .select('*')
        .in('group_id', groupIds);
      
      if (membersError) throw membersError;
      
      return groups.map(group => ({
        ...group,
        members: members.filter(m => m.group_id === group.id),
      })) as ParticipantGroupWithMembers[];
    },
    enabled: !!user,
  });
}

export function useCreateParticipantGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      members: Array<{ name: string; phone?: string; email?: string }>;
    }) => {
      const { data: group, error: groupError } = await supabase
        .from('participant_groups')
        .insert({ name: data.name, user_id: user!.id })
        .select()
        .single();
      
      if (groupError) throw groupError;
      
      if (data.members.length > 0) {
        const { error: membersError } = await supabase
          .from('participant_group_members')
          .insert(data.members.map(m => ({
            group_id: group.id,
            name: m.name,
            phone: m.phone || null,
            email: m.email || null,
          })));
        
        if (membersError) throw membersError;
      }
      
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant-groups'] });
      toast({ title: 'Grupo criado', description: 'O grupo de participantes foi criado com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível criar o grupo.', variant: 'destructive' });
    },
  });
}

export function useDeleteParticipantGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('participant_groups')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant-groups'] });
      toast({ title: 'Grupo eliminado', description: 'O grupo foi eliminado com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível eliminar o grupo.', variant: 'destructive' });
    },
  });
}
