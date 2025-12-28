import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CURRENCIES, INVESTMENT_TYPES, INTEREST_FREQUENCIES, COUPON_FREQUENCIES } from '@/lib/constants';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useAccounts } from '@/hooks/useAccounts';

const baseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  investment_type: z.enum(['term_deposit', 'bond_otnr']),
  principal_amount: z.coerce.number().positive('Valor deve ser positivo'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  maturity_date: z.string().optional(),
  currency: z.string().min(1, 'Moeda é obrigatória'),
  institution_name: z.string().optional(),
  notes: z.string().optional(),
});

const termDepositSchema = z.object({
  interest_rate_annual: z.coerce.number().min(0).max(100, 'Taxa máxima 100%'),
  term_days: z.coerce.number().int().positive('Prazo deve ser positivo'),
  interest_payment_frequency: z.enum(['monthly', 'quarterly', 'semiannual', 'annual', 'at_maturity']),
  tax_rate: z.coerce.number().min(0).max(100).optional(),
  auto_renew: z.boolean().default(false),
});

const bondSchema = z.object({
  coupon_rate_annual: z.coerce.number().min(0).max(100, 'Taxa máxima 100%'),
  coupon_frequency: z.enum(['monthly', 'quarterly', 'semiannual', 'annual']),
  quantity: z.coerce.number().int().positive('Quantidade deve ser positiva'),
  face_value_per_unit: z.coerce.number().positive('Valor nominal deve ser positivo'),
  isin: z.string().optional(),
  custodian_institution: z.string().optional(),
});

type BaseFormData = z.infer<typeof baseSchema>;
type TermDepositData = z.infer<typeof termDepositSchema>;
type BondData = z.infer<typeof bondSchema>;

interface InvestmentFormProps {
  onSubmit: (data: {
    investment: BaseFormData;
    termDeposit?: TermDepositData;
    bondOTNR?: BondData;
    accountId?: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const accountSchema = z.object({
  account_id: z.string().optional(),
});

export function InvestmentForm({ onSubmit, onCancel, isLoading }: InvestmentFormProps) {
  const { data: accounts = [] } = useAccounts();
  
  const baseForm = useForm<BaseFormData>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: '',
      investment_type: 'term_deposit',
      principal_amount: 0,
      start_date: new Date().toISOString().split('T')[0],
      currency: 'AOA',
      institution_name: '',
      notes: '',
    },
  });

  const accountForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      account_id: '',
    },
  });

  const termDepositForm = useForm<TermDepositData>({
    resolver: zodResolver(termDepositSchema),
    defaultValues: {
      interest_rate_annual: 0,
      term_days: 365,
      interest_payment_frequency: 'at_maturity',
      tax_rate: 10,
      auto_renew: false,
    },
  });

  const bondForm = useForm<BondData>({
    resolver: zodResolver(bondSchema),
    defaultValues: {
      coupon_rate_annual: 0,
      coupon_frequency: 'semiannual',
      quantity: 1,
      face_value_per_unit: 100000,
      isin: '',
      custodian_institution: '',
    },
  });

  const investmentType = baseForm.watch('investment_type');

  const handleSubmit = async () => {
    const baseValid = await baseForm.trigger();
    if (!baseValid) return;

    const baseData = baseForm.getValues();
    const accountData = accountForm.getValues();

    if (investmentType === 'term_deposit') {
      const tdValid = await termDepositForm.trigger();
      if (!tdValid) return;
      onSubmit({
        investment: baseData,
        termDeposit: termDepositForm.getValues(),
        accountId: accountData.account_id || undefined,
      });
    } else {
      const bondValid = await bondForm.trigger();
      if (!bondValid) return;
      onSubmit({
        investment: baseData,
        bondOTNR: bondForm.getValues(),
        accountId: accountData.account_id || undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Base Investment Fields */}
      <Form {...baseForm}>
        <div className="space-y-4">
          <FormField
            control={baseForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Investimento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: DP BAI 12 meses" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={baseForm.control}
            name="investment_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Investimento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INVESTMENT_TYPES.map((type) => (
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={baseForm.control}
              name="principal_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Principal</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={baseForm.control}
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={baseForm.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={baseForm.control}
              name="maturity_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={baseForm.control}
            name="institution_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instituição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Banco BAI" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={baseForm.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>
                <FormControl>
                  <Textarea placeholder="Observações adicionais..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Form {...accountForm}>
            <FormField
              control={accountForm.control}
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
          </Form>
        </div>
      </Form>

      {/* Term Deposit Specific Fields */}
      {investmentType === 'term_deposit' && (
        <Form {...termDepositForm}>
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-foreground">Detalhes do Depósito a Prazo</h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={termDepositForm.control}
                name="interest_rate_annual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Juro Anual (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={termDepositForm.control}
                name="term_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo (dias)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={termDepositForm.control}
                name="interest_payment_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pagamento de Juros</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INTEREST_FREQUENCIES.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={termDepositForm.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Imposto (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={termDepositForm.control}
              name="auto_renew"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Renovação Automática</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Renovar automaticamente no vencimento
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>
      )}

      {/* Bond/OTNR Specific Fields */}
      {investmentType === 'bond_otnr' && (
        <Form {...bondForm}>
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-foreground">Detalhes do OTNR</h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={bondForm.control}
                name="coupon_rate_annual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Cupão Anual (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bondForm.control}
                name="coupon_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência do Cupão</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUPON_FREQUENCIES.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={bondForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bondForm.control}
                name="face_value_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Nominal (unidade)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={bondForm.control}
                name="isin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISIN</FormLabel>
                    <FormControl>
                      <Input placeholder="AOXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bondForm.control}
                name="custodian_institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instituição Custodiante</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: BODIVA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
          {isLoading ? 'A guardar...' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}
