import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FinancialProduct, useCreateProductRequest } from '@/hooks/useFinancialProducts';
import { FileText, Loader2 } from 'lucide-react';

interface ProductRequestFormProps {
  product: FinancialProduct;
  initialAmount?: number;
  initialTermDays?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductRequestForm({ 
  product, 
  initialAmount, 
  initialTermDays, 
  onSuccess, 
  onCancel 
}: ProductRequestFormProps) {
  const [amount, setAmount] = useState(initialAmount || product.min_amount);
  const [termDays, setTermDays] = useState(initialTermDays || product.term_min_days || undefined);
  const [notes, setNotes] = useState('');

  const createRequest = useCreateProductRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createRequest.mutateAsync({
      product_id: product.id,
      requested_amount: amount,
      requested_term_days: termDays,
      notes: notes || undefined,
    });

    onSuccess?.();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: product.currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Solicitar: {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">{product.institution_name}</p>
            {product.interest_rate_annual && (
              <p className="text-muted-foreground">Taxa: {product.interest_rate_annual}% ao ano</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montante Pretendido</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={product.min_amount}
              max={product.max_amount || undefined}
              required
            />
            <p className="text-xs text-muted-foreground">
              Mínimo: {formatCurrency(product.min_amount)}
              {product.max_amount && ` | Máximo: ${formatCurrency(product.max_amount)}`}
            </p>
          </div>

          {(product.term_min_days || product.term_max_days) && (
            <div className="space-y-2">
              <Label htmlFor="termDays">Prazo (dias)</Label>
              <Input
                id="termDays"
                type="number"
                value={termDays || ''}
                onChange={(e) => setTermDays(Number(e.target.value))}
                min={product.term_min_days || undefined}
                max={product.term_max_days || undefined}
              />
              <p className="text-xs text-muted-foreground">
                {product.term_min_days && `Mínimo: ${product.term_min_days} dias`}
                {product.term_min_days && product.term_max_days && ' | '}
                {product.term_max_days && `Máximo: ${product.term_max_days} dias`}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais sobre a sua solicitação..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={createRequest.isPending} className="flex-1">
              {createRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Solicitação
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
