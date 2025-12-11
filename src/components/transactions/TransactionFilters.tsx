import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TRANSACTION_TYPES } from '@/lib/constants';
import { useActiveAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';

interface TransactionFiltersProps {
  filters: {
    startDate?: string;
    endDate?: string;
    accountId?: string;
    type?: 'income' | 'expense' | 'transfer';
    categoryId?: string;
  };
  onFiltersChange: (filters: TransactionFiltersProps['filters']) => void;
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const { data: accounts } = useActiveAccounts();
  const { data: categories } = useCategories();

  const hasActiveFilters = Object.values(filters).some(v => v);

  const clearFilters = () => {
    onFiltersChange({});
  };

  const updateFilter = (key: string, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  return (
    <div className="bg-card border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Filtros</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Data Início</Label>
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Data Fim</Label>
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Conta</Label>
          <Select
            value={filters.accountId || 'all'}
            onValueChange={(value) => updateFilter('accountId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Tipo</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => updateFilter('type', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {TRANSACTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Categoria</Label>
          <Select
            value={filters.categoryId || 'all'}
            onValueChange={(value) => updateFilter('categoryId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
