import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/constants';
import { useAccounts } from '@/hooks/useAccounts';

const contributionSchema = z.object({
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  account_id: z.string().optional(),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface ContributionFormProps {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  currency: string;
  onSubmit: (data: { amount: number; accountId?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ContributionForm({
  goalName,
  currentAmount,
  targetAmount,
  currency,
  onSubmit,
  onCancel,
  isLoading,
}: ContributionFormProps) {
  const remaining = targetAmount - currentAmount;
  const { data: accounts = [] } = useAccounts();

  const form = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: 0,
      account_id: '',
    },
  });

  const handleSubmit = (data: ContributionFormData) => {
    onSubmit({ amount: data.amount, accountId: data.account_id || undefined });
  };

  const handleFillRemaining = () => {
    if (remaining > 0) {
      form.setValue('amount', remaining);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium">{goalName}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Poupado: </span>
              <span className="font-medium">{formatCurrency(currentAmount, currency)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Alvo: </span>
              <span className="font-medium">{formatCurrency(targetAmount, currency)}</span>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Falta: </span>
            <span className="font-medium text-primary">{formatCurrency(remaining, currency)}</span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor da Contribuição</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                {remaining > 0 && (
                  <Button type="button" variant="outline" onClick={handleFillRemaining}>
                    Preencher
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conta de Origem</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione uma conta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                A transação será registada nesta conta
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'A guardar...' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
