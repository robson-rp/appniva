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
import { CostCenter } from '@/hooks/useCostCenters';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['income_center', 'expense_center']),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface CostCenterFormProps {
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CostCenter>;
}

export const CostCenterForm = ({
  onSubmit,
  isLoading,
  defaultValues,
}: CostCenterFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      type: defaultValues?.type || 'expense_center',
      description: defaultValues?.description || '',
      is_active: defaultValues?.is_active ?? true,
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
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Marketing, Operações" {...field} />
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
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income_center">Centro de Receita</SelectItem>
                  <SelectItem value="expense_center">Centro de Despesa</SelectItem>
                </SelectContent>
              </Select>
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
                <Textarea
                  placeholder="Descrição do centro de custo"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </Form>
  );
};
