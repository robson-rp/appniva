import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FutureExpense {
  name: string;
  amount: number;
  month: number;
}

interface SimulatorFormData {
  name: string;
  monthly_income_estimate: number;
  monthly_expense_estimate: number;
  salary_increase_rate: number;
  investment_return_rate: number;
  inflation_rate: number;
  time_horizon_years: number;
  future_expenses: FutureExpense[];
}

interface SimulatorFormProps {
  defaultValues?: Partial<SimulatorFormData>;
  onSubmit: (data: SimulatorFormData) => void;
  onSimulate: (data: SimulatorFormData) => void;
  isLoading?: boolean;
}

export function SimulatorForm({ defaultValues, onSubmit, onSimulate, isLoading }: SimulatorFormProps) {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<SimulatorFormData>({
    defaultValues: {
      name: '',
      monthly_income_estimate: 0,
      monthly_expense_estimate: 0,
      salary_increase_rate: 5,
      investment_return_rate: 8,
      inflation_rate: 20,
      time_horizon_years: 10,
      future_expenses: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'future_expenses',
  });

  const formValues = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nome do Cenário</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Ex: Cenário Optimista"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_income_estimate">Rendimento Mensal (Kz)</Label>
            <Input
              id="monthly_income_estimate"
              type="number"
              {...register('monthly_income_estimate', { valueAsNumber: true, min: 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_expense_estimate">Despesas Mensais (Kz)</Label>
            <Input
              id="monthly_expense_estimate"
              type="number"
              {...register('monthly_expense_estimate', { valueAsNumber: true, min: 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_horizon_years">Horizonte Temporal (anos)</Label>
            <Input
              id="time_horizon_years"
              type="number"
              {...register('time_horizon_years', { valueAsNumber: true, min: 1, max: 50 })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Taxas e Projeções</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="salary_increase_rate">Aumento Salarial (%/ano)</Label>
            <Input
              id="salary_increase_rate"
              type="number"
              step="0.1"
              {...register('salary_increase_rate', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment_return_rate">Retorno Investimentos (%/ano)</Label>
            <Input
              id="investment_return_rate"
              type="number"
              step="0.1"
              {...register('investment_return_rate', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inflation_rate">Inflação (%/ano)</Label>
            <Input
              id="inflation_rate"
              type="number"
              step="0.1"
              {...register('inflation_rate', { valueAsNumber: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Future Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Gastos Futuros Planeados</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', amount: 0, month: 12 })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum gasto futuro planeado. Adicione compras grandes, viagens, etc.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Descrição</Label>
                    <Input
                      {...register(`future_expenses.${index}.name`)}
                      placeholder="Ex: Carro novo"
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <Label className="text-xs">Valor (Kz)</Label>
                    <Input
                      type="number"
                      {...register(`future_expenses.${index}.amount`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Mês</Label>
                    <Input
                      type="number"
                      {...register(`future_expenses.${index}.month`, { valueAsNumber: true, min: 1 })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSimulate(formValues)}
        >
          Simular
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'A guardar...' : 'Guardar Cenário'}
        </Button>
      </div>
    </form>
  );
}
