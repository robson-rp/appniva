import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';

const budgetSchema = z.object({
  category_id: z.string().min(1, 'Seleccione uma categoria'),
  amount_limit: z.coerce.number().positive('Limite deve ser positivo'),
  month: z.string().min(1, 'Mês é obrigatório'),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  defaultValues?: Partial<BudgetFormValues>;
  onSubmit: (data: BudgetFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
  existingCategoryIds?: string[];
}

export function BudgetForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Guardar', existingCategoryIds = [] }: BudgetFormProps) {
  const { data: categories } = useCategories('expense');
  
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: '',
      amount_limit: 0,
      month: new Date().toISOString().slice(0, 7),
      ...defaultValues,
    },
  });

  // Filter out categories that already have budgets for this month
  const availableCategories = categories?.filter(
    cat => !existingCategoryIds.includes(cat.id) || cat.id === defaultValues?.category_id
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableCategories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || '#6366f1' }}
                        />
                        {category.name}
                      </div>
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
          name="amount_limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite Mensal (Kz)</FormLabel>
              <FormControl>
                <Input type="number" step="100" min="0" placeholder="Ex: 50000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mês</FormLabel>
              <FormControl>
                <Input type="month" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'A guardar...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
