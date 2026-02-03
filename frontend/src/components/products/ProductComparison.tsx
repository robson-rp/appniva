import { FinancialProduct } from '@/hooks/useFinancialProducts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

interface ProductComparisonProps {
  products: FinancialProduct[];
  onSelect?: (product: FinancialProduct) => void;
}

type SortField = 'interest_rate_annual' | 'min_amount' | 'term_min_days';
type SortOrder = 'asc' | 'desc';

export function ProductComparison({ products, onSelect }: ProductComparisonProps) {
  const [sortField, setSortField] = useState<SortField>('interest_rate_annual');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTerm = (days: number | null) => {
    if (!days) return '-';
    const months = Math.floor(days / 30);
    if (months >= 1) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    return `${days} dias`;
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum produto disponível para comparação.
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Produto</TableHead>
            <TableHead>Instituição</TableHead>
            <TableHead>
              <SortButton field="interest_rate_annual">Taxa Anual</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="min_amount">Mínimo</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="term_min_days">Prazo</SortButton>
            </TableHead>
            <TableHead>Características</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product, index) => (
            <TableRow key={product.id} className={index === 0 ? 'bg-primary/5' : ''}>
              <TableCell>
                <div className="font-medium">{product.name}</div>
                {index === 0 && (
                  <Badge variant="default" className="mt-1">Melhor Taxa</Badge>
                )}
              </TableCell>
              <TableCell>{product.institution_name}</TableCell>
              <TableCell>
                {product.interest_rate_annual !== null ? (
                  <span className="font-bold text-primary">{product.interest_rate_annual}%</span>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>{formatCurrency(product.min_amount, product.currency)}</TableCell>
              <TableCell>
                {formatTerm(product.term_min_days)}
                {product.term_max_days && product.term_max_days !== product.term_min_days && 
                  ` - ${formatTerm(product.term_max_days)}`}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {product.features.slice(0, 2).map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {product.features.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.features.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {onSelect && (
                  <Button size="sm" onClick={() => onSelect(product)}>
                    Selecionar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
