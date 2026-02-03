import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useCostCenters } from '@/hooks/useCostCenters';

const formSchema = z.object({
  cost_center_id: z.string().min(1, 'Selecione um centro de custo'),
  month: z.string().min(1, 'Mês é obrigatório'),
  amount_limit: z.coerce.number().positive('Limite deve ser positivo'),
  alert_threshold: z.number().min(50).max(100).default(80),
});

type FormValues = z.infer<typeof formSchema>;

interface CostCenterBudgetFormProps {
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
  defaultValues?: Partial<FormValues>;
  existingCenterIds?: string[];
}

export const CostCenterBudgetForm = ({
  onSubmit,
  isLoading,
  defaultValues,
  existingCenterIds = [],
}: CostCenterBudgetFormProps) => {
  const { data: costCenters } = useCostCenters();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost_center_id: defaultValues?.cost_center_id || '',
      month: defaultValues?.month || currentMonth,
      amount_limit: defaultValues?.amount_limit || 0,
      alert_threshold: defaultValues?.alert_threshold || 80,
    },
  });

  const alertThreshold = form.watch('alert_threshold');

  // Filter expense centers that don't already have a budget for the selected month
  const availableCenters = costCenters?.filter(
    (c) => c.type === 'expense_center' && 
    (defaultValues?.cost_center_id === c.id || !existingCenterIds.includes(c.id))
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="cost_center_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Centro de Custo</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!!defaultValues?.cost_center_id}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o centro de custo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableCenters?.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name}
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
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mês</FormLabel>
              <FormControl>
                <Input 
                  type="month" 
                  {...field} 
                  disabled={!!defaultValues?.month}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount_limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite de Orçamento (AOA)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alert_threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite de Alerta: {field.value}%</FormLabel>
              <FormControl>
                <Slider
                  min={50}
                  max={100}
                  step={5}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                  className="py-4"
                />
              </FormControl>
              <FormDescription>
                Alerta quando gastos atingirem {alertThreshold}% do limite
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Orçamento'}
        </Button>
      </form>
    </Form>
  );
};
