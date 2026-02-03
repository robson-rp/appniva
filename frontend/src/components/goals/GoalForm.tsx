import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CURRENCIES, GOAL_STATUSES } from '@/lib/constants';

const goalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().max(500).optional(),
  target_amount: z.coerce.number().positive('Valor deve ser positivo'),
  current_saved_amount: z.coerce.number().min(0).default(0),
  target_date: z.string().optional(),
  currency: z.string().min(1, 'Moeda é obrigatória'),
  status: z.enum(['in_progress', 'completed', 'cancelled']).default('in_progress'),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  initialData?: Partial<GoalFormData>;
  onSubmit: (data: GoalFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export function GoalForm({ initialData, onSubmit, onCancel, isLoading, isEditing }: GoalFormProps) {
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      target_amount: initialData?.target_amount || 0,
      current_saved_amount: initialData?.current_saved_amount || 0,
      target_date: initialData?.target_date || '',
      currency: initialData?.currency || 'AOA',
      status: initialData?.status || 'in_progress',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Meta</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Fundo de emergência" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva o objectivo desta meta..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="target_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Alvo</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moeda</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditing && (
          <FormField
            control={form.control}
            name="current_saved_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Poupado Actual</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="target_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Alvo (opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GOAL_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'A guardar...' : isEditing ? 'Guardar' : 'Criar Meta'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
