import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCIES, ACCOUNT_TYPES, ANGOLA_BANKS, MOBILE_WALLETS } from '@/lib/constants';
import { Database } from '@/integrations/supabase/types';

type AccountType = Database['public']['Enums']['account_type'];

const accountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  account_type: z.enum(['bank', 'wallet', 'cash', 'other'] as const),
  institution_name: z.string().optional(),
  currency: z.string().min(1, 'Moeda é obrigatória'),
  initial_balance: z.coerce.number().min(0, 'Saldo deve ser positivo'),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormProps {
  defaultValues?: Partial<AccountFormValues>;
  onSubmit: (data: AccountFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function AccountForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Guardar' }: AccountFormProps) {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      account_type: 'bank',
      institution_name: '',
      currency: 'AOA',
      initial_balance: 0,
      ...defaultValues,
    },
  });

  const accountType = form.watch('account_type');

  const getInstitutionOptions = () => {
    switch (accountType) {
      case 'bank':
        return ANGOLA_BANKS;
      case 'wallet':
        return MOBILE_WALLETS;
      default:
        return [];
    }
  };

  const institutionOptions = getInstitutionOptions();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Conta</FormLabel>
              <FormControl>
                <Input placeholder="Ex: BFA Kz, Unitel Money" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Conta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
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

        {institutionOptions.length > 0 && (
          <FormField
            control={form.control}
            name="institution_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instituição</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione a instituição" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {institutionOptions.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moeda</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione a moeda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.name}
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
          name="initial_balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Saldo Inicial</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" {...field} />
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
