import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FinancialProduct, ProductType } from '@/hooks/useFinancialProducts';
import { Banknote, Shield, CreditCard, TrendingUp, Check, Building2 } from 'lucide-react';

const typeConfig: Record<ProductType, { label: string; icon: React.ElementType; color: string }> = {
  term_deposit: { label: 'Depósito a Prazo', icon: Banknote, color: 'bg-emerald-500' },
  insurance: { label: 'Seguro', icon: Shield, color: 'bg-blue-500' },
  microcredit: { label: 'Microcrédito', icon: CreditCard, color: 'bg-amber-500' },
  fund: { label: 'Fundo', icon: TrendingUp, color: 'bg-purple-500' },
};

interface ProductCardProps {
  product: FinancialProduct;
  onSimulate?: () => void;
  onRequest?: () => void;
  isSelected?: boolean;
}

export function ProductCard({ product, onSimulate, onRequest, isSelected }: ProductCardProps) {
  const config = typeConfig[product.product_type];
  const Icon = config.icon;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: product.currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTerm = (days: number) => {
    if (days >= 365) return `${Math.floor(days / 365)} ano${days >= 730 ? 's' : ''}`;
    if (days >= 30) return `${Math.floor(days / 30)} mês${days >= 60 ? 'es' : ''}`;
    return `${days} dias`;
  };

  return (
    <Card className={`transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                {product.institution_name}
              </div>
            </div>
          </div>
          <Badge variant="secondary">{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {product.interest_rate_annual !== null && (
            <div>
              <span className="text-muted-foreground">Taxa Anual</span>
              <p className="text-xl font-bold text-primary">{product.interest_rate_annual}%</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Montante Mínimo</span>
            <p className="font-semibold">{formatCurrency(product.min_amount)}</p>
          </div>
          {product.max_amount && (
            <div>
              <span className="text-muted-foreground">Montante Máximo</span>
              <p className="font-semibold">{formatCurrency(product.max_amount)}</p>
            </div>
          )}
          {product.term_min_days && (
            <div>
              <span className="text-muted-foreground">Prazo</span>
              <p className="font-semibold">
                {formatTerm(product.term_min_days)}
                {product.term_max_days && product.term_max_days !== product.term_min_days && 
                  ` - ${formatTerm(product.term_max_days)}`}
              </p>
            </div>
          )}
        </div>

        {product.features.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Características</span>
            <ul className="space-y-1">
              {product.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="h-3 w-3 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onSimulate && (product.product_type === 'term_deposit' || product.product_type === 'microcredit') && (
            <Button variant="outline" size="sm" onClick={onSimulate} className="flex-1">
              Simular
            </Button>
          )}
          {onRequest && (
            <Button size="sm" onClick={onRequest} className="flex-1">
              Solicitar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
