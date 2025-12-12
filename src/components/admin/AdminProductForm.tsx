import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useAdminProducts';
import { FinancialProduct, ProductType } from '@/hooks/useFinancialProducts';
import { Loader2, Plus, X } from 'lucide-react';

interface AdminProductFormProps {
  product?: FinancialProduct;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const productTypes: { value: ProductType; label: string }[] = [
  { value: 'term_deposit', label: 'Depósito a Prazo' },
  { value: 'insurance', label: 'Seguro' },
  { value: 'microcredit', label: 'Microcrédito' },
  { value: 'fund', label: 'Fundo' },
];

export function AdminProductForm({ product, onSuccess, onCancel }: AdminProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [productType, setProductType] = useState<ProductType>(product?.product_type || 'term_deposit');
  const [institutionName, setInstitutionName] = useState(product?.institution_name || '');
  const [interestRate, setInterestRate] = useState<string>(product?.interest_rate_annual?.toString() || '');
  const [minAmount, setMinAmount] = useState<string>(product?.min_amount?.toString() || '10000');
  const [maxAmount, setMaxAmount] = useState<string>(product?.max_amount?.toString() || '');
  const [termMinDays, setTermMinDays] = useState<string>(product?.term_min_days?.toString() || '');
  const [termMaxDays, setTermMaxDays] = useState<string>(product?.term_max_days?.toString() || '');
  const [description, setDescription] = useState(product?.description || '');
  const [features, setFeatures] = useState<string[]>(product?.features || []);
  const [newFeature, setNewFeature] = useState('');
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [currency, setCurrency] = useState(product?.currency || 'AOA');

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      product_type: productType,
      institution_name: institutionName,
      interest_rate_annual: interestRate ? Number(interestRate) : undefined,
      min_amount: Number(minAmount),
      max_amount: maxAmount ? Number(maxAmount) : undefined,
      term_min_days: termMinDays ? Number(termMinDays) : undefined,
      term_max_days: termMaxDays ? Number(termMaxDays) : undefined,
      description: description || undefined,
      features,
      is_active: isActive,
      currency,
    };

    if (product) {
      await updateProduct.mutateAsync({ id: product.id, ...data });
    } else {
      await createProduct.mutateAsync(data);
    }

    onSuccess?.();
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Produto *</Label>
          <Select value={productType} onValueChange={(v) => setProductType(v as ProductType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution">Instituição *</Label>
          <Input
            id="institution"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Moeda</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AOA">AOA</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interestRate">Taxa de Juro Anual (%)</Label>
          <Input
            id="interestRate"
            type="number"
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minAmount">Montante Mínimo *</Label>
          <Input
            id="minAmount"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxAmount">Montante Máximo</Label>
          <Input
            id="maxAmount"
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="termMinDays">Prazo Mínimo (dias)</Label>
          <Input
            id="termMinDays"
            type="number"
            value={termMinDays}
            onChange={(e) => setTermMinDays(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="termMaxDays">Prazo Máximo (dias)</Label>
          <Input
            id="termMaxDays"
            type="number"
            value={termMaxDays}
            onChange={(e) => setTermMaxDays(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={setIsActive} id="isActive" />
          <Label htmlFor="isActive">Produto Activo</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Características</Label>
        <div className="flex gap-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Adicionar característica..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
          />
          <Button type="button" variant="outline" onClick={addFeature}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {features.map((feature, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
            >
              {feature}
              <button
                type="button"
                onClick={() => removeFeature(idx)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Guardar Alterações' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );
}
