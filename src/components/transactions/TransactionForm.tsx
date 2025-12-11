import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { TRANSACTION_TYPES } from '@/lib/constants';
import { useActiveAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useCategorizeTransaction, useLogPrediction } from '@/hooks/useCategoryPrediction';
import { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type TransactionType = Database['public']['Enums']['transaction_type'];

const transactionSchema = z.object({
  account_id: z.string().min(1, 'Seleccione uma conta'),
  type: z.enum(['income', 'expense', 'transfer'] as const),
  amount: z.coerce.number().positive('Montante deve ser positivo'),
  date: z.string().min(1, 'Data é obrigatória'),
  category_id: z.string().optional(),
  description: z.string().max(500).optional(),
  related_account_id: z.string().optional(),
}).refine((data) => {
  if (data.type === 'transfer' && !data.related_account_id) {
    return false;
  }
  return true;
}, {
  message: 'Seleccione a conta de destino para transferências',
  path: ['related_account_id'],
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormValues) => void;
  isLoading?: boolean;
}

interface CategorySuggestion {
  category_id: string;
  category_name: string;
  confidence: number;
  method: 'keyword' | 'ai' | 'none' | 'error';
}

export function TransactionForm({ onSubmit, isLoading }: TransactionFormProps) {
  const { data: accounts } = useActiveAccounts();
  const [suggestion, setSuggestion] = useState<CategorySuggestion | null>(null);
  const [suggestionAccepted, setSuggestionAccepted] = useState<boolean | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  const categorizeMutation = useCategorizeTransaction();
  const logPrediction = useLogPrediction();
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      account_id: '',
      type: 'expense',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category_id: '',
      description: '',
      related_account_id: '',
    },
  });

  const transactionType = form.watch('type');
  const selectedAccountId = form.watch('account_id');
  const description = form.watch('description');
  const selectedCategoryId = form.watch('category_id');
  
  const categoryType = transactionType === 'income' ? 'income' : 'expense';
  const { data: categories } = useCategories(transactionType !== 'transfer' ? categoryType : undefined);

  const availableDestinationAccounts = accounts?.filter(a => a.id !== selectedAccountId) || [];

  // Auto-categorize when description changes
  const categorizeDescription = useCallback(async (desc: string, type: 'expense' | 'income') => {
    if (!desc || desc.trim().length < 3) {
      setSuggestion(null);
      return;
    }

    try {
      const result = await categorizeMutation.mutateAsync({ description: desc, type });
      
      if (result.category_id && result.confidence > 0.3) {
        setSuggestion({
          category_id: result.category_id,
          category_name: result.category_name || '',
          confidence: result.confidence,
          method: result.method
        });
        setSuggestionAccepted(null);
        
        // Auto-apply if high confidence and no category selected
        if (result.confidence >= 0.7 && !selectedCategoryId) {
          form.setValue('category_id', result.category_id);
          setSuggestionAccepted(true);
        }
      } else {
        setSuggestion(null);
      }
    } catch (error) {
      console.error('Error categorizing:', error);
      setSuggestion(null);
    }
  }, [categorizeMutation, form, selectedCategoryId]);

  useEffect(() => {
    if (transactionType === 'transfer') {
      setSuggestion(null);
      return;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (description && description.trim().length >= 3) {
        categorizeDescription(description, categoryType as 'expense' | 'income');
      }
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [description, categoryType, transactionType]);

  const handleAcceptSuggestion = () => {
    if (suggestion) {
      form.setValue('category_id', suggestion.category_id);
      setSuggestionAccepted(true);
    }
  };

  const handleRejectSuggestion = () => {
    setSuggestionAccepted(false);
  };

  const handleSubmit = async (data: TransactionFormValues) => {
    // Log prediction acceptance if there was a suggestion
    if (suggestion && suggestionAccepted !== null) {
      try {
        await logPrediction.mutateAsync({
          predicted_category_id: suggestion.category_id,
          confidence: suggestion.confidence,
          description: data.description || '',
          accepted: suggestionAccepted
        });
      } catch (error) {
        console.error('Error logging prediction:', error);
      }
    }
    
    onSubmit(data);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {transactionType === 'transfer' ? 'Conta de Origem' : 'Conta'}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione a conta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {transactionType === 'transfer' && (
          <FormField
            control={form.control}
            name="related_account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta de Destino</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione a conta de destino" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableDestinationAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montante</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Descrição
                {categorizeMutation.isPending && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Adicione uma descrição para sugestão automática de categoria" 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Suggestion */}
        {suggestion && transactionType !== 'transfer' && suggestionAccepted !== true && (
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            getConfidenceColor(suggestion.confidence)
          )}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                Sugestão: {suggestion.category_name}
              </span>
              <Badge variant="outline" className="text-xs">
                {Math.round(suggestion.confidence * 100)}% confiança
              </Badge>
              {suggestion.method === 'ai' && (
                <Badge variant="secondary" className="text-xs">IA</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={handleAcceptSuggestion}
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={handleRejectSuggestion}
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        )}

        {transactionType !== 'transfer' && (
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Categoria
                  {suggestionAccepted === true && suggestion && (
                    <Badge variant="secondary" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Sugestão aceite
                    </Badge>
                  )}
                </FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  // If user manually changes category after suggestion
                  if (suggestion && value !== suggestion.category_id) {
                    setSuggestionAccepted(false);
                  }
                }} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione a categoria (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'A registar...' : 'Registar Transacção'}
        </Button>
      </form>
    </Form>
  );
}