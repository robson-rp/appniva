import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDocument } from '@/hooks/useDocuments';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function OCRReview() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: document, isLoading: docLoading } = useDocument(id || '');
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    account_id: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (document?.extracted_data) {
      const data = document.extracted_data;
      setFormData((prev) => ({
        ...prev,
        amount: data.amount?.toString() || '',
        description: data.description || '',
        date: data.date || prev.date,
      }));

      // Try to match suggested category
      if (data.suggested_category && categories.length > 0) {
        const matchedCategory = categories.find(
          (c) =>
            c.name.toLowerCase().includes(data.suggested_category!.toLowerCase()) ||
            data.suggested_category!.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedCategory) {
          setFormData((prev) => ({ ...prev, category_id: matchedCategory.id }));
        }
      }
    }
  }, [document, categories]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const activeAccounts = accounts.filter((a) => a.is_active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.account_id) {
      toast({
        title: 'Erro',
        description: 'Por favor selecione uma conta.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        category_id: formData.category_id || null,
        account_id: formData.account_id,
        currency: 'AOA',
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transação criada',
        description: 'A transação foi guardada com sucesso.',
      });
      navigate('/transactions');
    } catch (error: any) {
      toast({
        title: 'Erro ao guardar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || docLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Documento não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/ocr/upload')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/ocr/upload')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rever Dados Extraídos</h1>
          <p className="text-muted-foreground">
            Verifique e corrija os dados antes de guardar como transação.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Document Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Documento Original</CardTitle>
            <CardDescription>{document.original_filename}</CardDescription>
          </CardHeader>
          <CardContent>
            {document.file_type === 'image' ? (
              <img
                src={document.file_url}
                alt="Documento"
                className="w-full rounded-lg border"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/50">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Documento PDF</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => window.open(document.file_url, '_blank')}
                >
                  Abrir PDF
                </Button>
              </div>
            )}

            {document.extracted_data?.raw_text && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Texto Extraído</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg text-sm max-h-[200px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {document.extracted_data.raw_text}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Criar Transação
            </CardTitle>
            <CardDescription>
              Reveja os dados extraídos e faça correções se necessário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Transação</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'income' | 'expense') =>
                    setFormData({ ...formData, type: value, category_id: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (Kz)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Conta</Label>
                <Select
                  value={formData.account_id}
                  onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(
                      (category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Transação
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
