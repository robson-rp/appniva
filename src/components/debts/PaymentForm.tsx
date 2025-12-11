import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Debt } from '@/hooks/useDebts';

const formSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  payment_date: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PaymentFormProps {
  debt: Debt;
  onSubmit: (data: { amount: number; payment_date: string; notes?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PaymentForm({ debt, onSubmit, onCancel, isLoading }: PaymentFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: debt.installment_amount,
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: debt.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = (data: FormData) => {
    onSubmit({
      amount: data.amount,
      payment_date: data.payment_date,
      notes: data.notes || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/50 space-y-1">
          <p className="text-sm text-muted-foreground">Dívida</p>
          <p className="font-medium">{debt.name}</p>
          <p className="text-sm text-muted-foreground">
            Saldo actual: <span className="font-medium text-foreground">{formatCurrency(debt.current_balance)}</span>
          </p>
        </div>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Pagamento</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Prestação sugerida: {formatCurrency(debt.installment_amount)}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do Pagamento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações sobre o pagamento..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'A registar...' : 'Registar Pagamento'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
