import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SchoolFeeTemplate {
  id: string;
  user_id: string;
  name: string;
  school_name: string | null;
  education_level: string;
  fee_type: string;
  amount: number;
  currency: string;
  is_recurring: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useSchoolFeeTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['school-fee-templates'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('school_fee_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data as SchoolFeeTemplate[];
    },
    enabled: !!user,
  });
}

export function useCreateSchoolFeeTemplate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<SchoolFeeTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Utilizador não autenticado');
      
      const { data, error } = await supabase
        .from('school_fee_templates')
        .insert({
          ...template,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-fee-templates'] });
      toast.success('Modelo criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Erro ao criar modelo');
    },
  });
}

export function useDeleteSchoolFeeTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('school_fee_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-fee-templates'] });
      toast.success('Modelo eliminado');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Erro ao eliminar modelo');
    },
  });
}
