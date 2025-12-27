import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import {
  useCreateSubscription,
  useUpdateSubscription,
  Subscription,
  BillingCycle,
} from '@/hooks/useSubscriptions';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  amount: z.coerce.number().positive('Montante deve ser positivo'),
  billing_cycle: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  next_renewal_date: z.date(),
  category_id: z.string().optional(),
  account_id: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  alert_days_before: z.coerce.number().min(0).max(30),
});

type FormData = z.infer<typeof formSchema>;

interface SubscriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSubscription?: Subscription | null;
}

const billingCycleLabels: Record<BillingCycle, string> = {
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

const iconOptions = [
  { value: 'tv', label: 'TV/Streaming' },
  { value: 'music', label: 'Música' },
  { value: 'cloud', label: 'Cloud/Storage' },
  { value: 'gamepad-2', label: 'Jogos' },
  { value: 'newspaper', label: 'Notícias' },
  { value: 'dumbbell', label: 'Fitness' },
  { value: 'book-open', label: 'Educação' },
  { value: 'shield', label: 'Segurança' },
  { value: 'smartphone', label: 'App/Software' },
  { value: 'credit-card', label: 'Outro' },
];

const colorOptions = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
];

export function SubscriptionForm({
  open,
  onOpenChange,
  editingSubscription,
}: SubscriptionFormProps) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();

  const expenseCategories = categories?.filter((c) => c.type === 'expense');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editingSubscription
      ? {
          name: editingSubscription.name,
          description: editingSubscription.description || '',
          amount: editingSubscription.amount,
          billing_cycle: editingSubscription.billing_cycle,
          next_renewal_date: new Date(editingSubscription.next_renewal_date),
          category_id: editingSubscription.category_id || undefined,
          account_id: editingSubscription.account_id || undefined,
          icon: editingSubscription.icon,
          color: editingSubscription.color,
          alert_days_before: editingSubscription.alert_days_before,
        }
      : {
          name: '',
          description: '',
          amount: 0,
          billing_cycle: 'monthly',
          next_renewal_date: new Date(),
          icon: 'credit-card',
          color: '#6366f1',
          alert_days_before: 3,
        },
  });

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.name,
      description: data.description || null,
      amount: data.amount,
      billing_cycle: data.billing_cycle,
      next_renewal_date: format(data.next_renewal_date, 'yyyy-MM-dd'),
      category_id: data.category_id || null,
      account_id: data.account_id || null,
      icon: data.icon || 'credit-card',
      color: data.color || '#6366f1',
      alert_days_before: data.alert_days_before,
    };

    if (editingSubscription) {
      await updateMutation.mutateAsync({ id: editingSubscription.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSubscription ? 'Editar' : 'Nova'} Subscrição
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Netflix, Spotify, Gym" {...field} />
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
                    <Input placeholder="Plano Premium, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing_cycle"
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
                        {Object.entries(billingCycleLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="next_renewal_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Próxima Renovação</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy')
                          ) : (
                            <span>Seleccione</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <div className="flex flex-wrap gap-1">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => field.onChange(color)}
                          className={cn(
                            'h-6 w-6 rounded-full border-2 transition-transform',
                            field.value === color
                              ? 'border-foreground scale-110'
                              : 'border-transparent hover:scale-105'
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories?.map((category) => (
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

            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta de Débito (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
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
              name="alert_days_before"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alertar dias antes</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={30} {...field} />
                  </FormControl>
                  <FormDescription>
                    Receber alerta X dias antes da renovação
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingSubscription ? 'Guardar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
