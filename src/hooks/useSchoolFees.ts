import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SchoolFee {
  id: string;
  user_id: string;
  student_name: string;
  school_name: string;
  education_level: 'pre_school' | 'primary' | 'secondary' | 'university' | 'vocational' | 'other';
  fee_type: 'tuition' | 'registration' | 'materials' | 'transport' | 'uniform' | 'meals' | 'other';
  amount: number;
  currency: string;
  academic_year: string;
  term: '1' | '2' | '3' | 'annual' | null;
  due_date: string;
  paid: boolean;
  paid_date: string | null;
  payment_proof_url: string | null;
  account_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const EDUCATION_LEVELS = [
  { value: 'pre_school', label: 'Pré-Escolar' },
  { value: 'primary', label: 'Ensino Primário' },
  { value: 'secondary', label: 'Ensino Secundário' },
  { value: 'university', label: 'Universidade' },
  { value: 'vocational', label: 'Ensino Técnico' },
  { value: 'other', label: 'Outro' },
] as const;

export const FEE_TYPES = [
  { value: 'tuition', label: 'Propina' },
  { value: 'registration', label: 'Matrícula' },
  { value: 'materials', label: 'Material Escolar' },
  { value: 'transport', label: 'Transporte' },
  { value: 'uniform', label: 'Uniforme' },
  { value: 'meals', label: 'Refeições' },
  { value: 'other', label: 'Outro' },
] as const;

export const TERMS = [
  { value: '1', label: '1º Trimestre' },
  { value: '2', label: '2º Trimestre' },
  { value: '3', label: '3º Trimestre' },
  { value: 'annual', label: 'Anual' },
] as const;

export function useSchoolFees() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['school-fees', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_fees')
        .select('*')
        .eq('user_id', user!.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as SchoolFee[];
    },
    enabled: !!user,
  });
}

export function useSchoolFeeStats() {
  const { data: fees = [] } = useSchoolFees();
  
  const totalDue = fees.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0);
  const overdue = fees.filter(f => !f.paid && new Date(f.due_date) < new Date()).length;
  const upcoming = fees.filter(f => {
    if (f.paid) return false;
    const dueDate = new Date(f.due_date);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return dueDate >= now && dueDate <= thirtyDaysFromNow;
  }).length;
  
  const byStudent = fees.reduce((acc, f) => {
    if (!acc[f.student_name]) {
      acc[f.student_name] = { total: 0, paid: 0, due: 0 };
    }
    acc[f.student_name].total += f.amount;
    if (f.paid) {
      acc[f.student_name].paid += f.amount;
    } else {
      acc[f.student_name].due += f.amount;
    }
    return acc;
  }, {} as Record<string, { total: number; paid: number; due: number }>);
  
  return {
    totalDue,
    totalPaid,
    overdue,
    upcoming,
    byStudent,
    count: fees.length,
  };
}

export function useCreateSchoolFee() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (fee: Omit<SchoolFee, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('school_fees')
        .insert({ ...fee, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-fees'] });
      toast({ title: 'Propina registada', description: 'A propina foi registada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível registar a propina.', variant: 'destructive' });
    },
  });
}

export function useUpdateSchoolFee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SchoolFee> & { id: string }) => {
      const { error } = await supabase
        .from('school_fees')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-fees'] });
      toast({ title: 'Propina atualizada', description: 'A propina foi atualizada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível atualizar a propina.', variant: 'destructive' });
    },
  });
}

export function useMarkSchoolFeePaid() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, proofFile, accountId }: { id: string; proofFile?: File; accountId?: string }) => {
      // First get the school fee details for transaction description
      const { data: fee, error: feeError } = await supabase
        .from('school_fees')
        .select('*')
        .eq('id', id)
        .single();
      
      if (feeError) throw feeError;
      
      let payment_proof_url: string | null = null;
      
      // Upload proof file if provided
      if (proofFile && user) {
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${user.id}/${id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('school-fee-receipts')
          .upload(fileName, proofFile);
        
        if (uploadError) throw uploadError;
        
        // Get signed URL for private bucket
        const { data: signedUrlData } = await supabase.storage
          .from('school-fee-receipts')
          .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry
        
        payment_proof_url = signedUrlData?.signedUrl || null;
      }
      
      const { error } = await supabase
        .from('school_fees')
        .update({ 
          paid: true, 
          paid_date: new Date().toISOString().split('T')[0],
          ...(payment_proof_url && { payment_proof_url })
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Create expense transaction if account is provided
      if (accountId && user) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            account_id: accountId,
            type: 'expense',
            amount: fee.amount,
            currency: fee.currency,
            date: new Date().toISOString().split('T')[0],
            description: `Propina: ${fee.student_name} - ${fee.school_name} (${fee.fee_type})`,
            source: 'school_fee',
          });
        
        if (transactionError) {
          console.error('Failed to create transaction:', transactionError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-fees'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Propina paga', description: 'A propina foi marcada como paga.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível marcar a propina como paga.', variant: 'destructive' });
    },
  });
}

export function useDeleteSchoolFee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('school_fees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-fees'] });
      toast({ title: 'Propina eliminada', description: 'A propina foi eliminada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível eliminar a propina.', variant: 'destructive' });
    },
  });
}
