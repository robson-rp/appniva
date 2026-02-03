import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ExtractedTransaction {
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  suggested_category: string;
}

export interface ExtractedData {
  document_type?: 'receipt' | 'bank_statement';
  amount?: number;
  description?: string;
  date?: string;
  suggested_category?: string;
  raw_text?: string;
  // Bank statement specific fields
  bank_name?: string;
  account_holder?: string;
  statement_period?: { start: string; end: string };
  transactions?: ExtractedTransaction[];
}

export interface UploadedDocument {
  id: string;
  user_id: string;
  file_url: string;
  file_type: 'image' | 'pdf';
  original_filename: string | null;
  processed: boolean;
  extracted_data: ExtractedData | null;
  created_at: string;
  updated_at: string;
}

export function useDocuments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UploadedDocument[];
    },
    enabled: !!user,
  });

  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Não autenticado');

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const isPdf = file.type === 'application/pdf';
      const fileType = isPdf ? 'pdf' : 'image';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('financial-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('financial-documents')
        .getPublicUrl(fileName);

      // Create document record
      const { data, error } = await supabase
        .from('uploaded_documents')
        .insert({
          user_id: user.id,
          file_url: urlData.publicUrl,
          file_type: fileType,
          original_filename: file.name,
        })
        .select()
        .single();

      if (error) throw error;
      return data as UploadedDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Documento carregado',
        description: 'O documento foi carregado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao carregar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const processDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const { data, error } = await supabase.functions.invoke('process-ocr', {
        body: { documentId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro no processamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('uploaded_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Documento eliminado',
        description: 'O documento foi eliminado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao eliminar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    documents,
    isLoading,
    uploadDocument,
    processDocument,
    deleteDocument,
  };
}

export function useDocument(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as UploadedDocument;
    },
    enabled: !!user && !!id,
  });
}
