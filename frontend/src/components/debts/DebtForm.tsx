import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Debt, DebtType, InstallmentFrequency } from '@/hooks/useDebts';

const debtTypes: { value: DebtType; label: string }[] = [
  { value: 'personal', label: 'Pessoal' },
  { value: 'mortgage', label: 'Hipoteca' },
  { value: 'car', label: 'Automóvel' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'student', label: 'Estudantil' },
  { value: 'other', label: 'Outro' },
];

const frequencies: { value: InstallmentFrequency; label: string }[] = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
];

const currencies = [
  { value: 'AOA', label: 'AOA - Kwanza' },
  { value: 'USD', label: 'USD - Dólar' },
  { value: 'EUR', label: 'EUR - Euro' },
];

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['personal', 'mortgage', 'car', 'credit_card', 'student', 'other'] as const),
  principal_amount: z.number().positive('Valor deve ser positivo'),
  current_balance: z.number().min(0, 'Saldo não pode ser negativo'),
  interest_rate_annual: z.number().min(0, 'Taxa não pode ser negativa'),
  installment_amount: z.number().positive('Prestação deve ser positiva'),
  installment_frequency: z.enum(['monthly', 'quarterly', 'semiannual', 'annual'] as const),
  next_payment_date: z.string().optional(),
  institution: z.string().optional(),
  currency: z.string().default('AOA'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DebtFormProps {
  debt?: Debt | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DebtForm({ debt, onSubmit, onCancel, isLoading }: DebtFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: debt?.name || '',
      type: debt?.type || 'personal',
      principal_amount: debt?.principal_amount || 0,
      current_balance: debt?.current_balance || 0,
      interest_rate_annual: debt?.interest_rate_annual || 0,
      installment_amount: debt?.installment_amount || 0,
      installment_frequency: debt?.installment_frequency || 'monthly',
      next_payment_date: debt?.next_payment_date || '',
      institution: debt?.institution || '',
      currency: debt?.currency || 'AOA',
      notes: debt?.notes || '',
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      next_payment_date: data.next_payment_date || undefined,
      institution: data.institution || undefined,
      notes: data.notes || undefined,
    });
  };

  // Auto-fill current_balance when creating new debt
  const principalAmount = form.watch('principal_amount');
  const isEditing = !!debt;
  
  if (!isEditing && principalAmount && form.getValues('current_balance') === 0) {
    form.setValue('current_balance', principalAmount);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nome da Dívida</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Crédito Habitação BFA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {debtTypes.map((type) => (
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
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moeda</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
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
            name="principal_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Principal</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo Actual</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="installment_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Prestação</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="installment_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequência</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
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
            name="interest_rate_annual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxa de Juro Anual (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="next_payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Próximo Pagamento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="institution"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Instituição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Banco BFA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Notas</FormLabel>
                <FormControl>
                  <Textarea placeholder="Observações adicionais..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'A guardar...' : debt ? 'Actualizar' : 'Criar Dívida'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
