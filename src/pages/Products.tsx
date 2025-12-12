import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductSimulator } from '@/components/products/ProductSimulator';
import { ProductRequestForm } from '@/components/products/ProductRequestForm';
import { ProductComparison } from '@/components/products/ProductComparison';
import { MyRequests } from '@/components/products/MyRequests';
import { useFinancialProducts, FinancialProduct, ProductType } from '@/hooks/useFinancialProducts';
import { Loader2, Banknote, Shield, CreditCard, TrendingUp, LayoutGrid, Table, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const productTypes: { type: ProductType; label: string; icon: React.ElementType }[] = [
  { type: 'term_deposit', label: 'Depósitos a Prazo', icon: Banknote },
  { type: 'insurance', label: 'Seguros', icon: Shield },
  { type: 'microcredit', label: 'Microcrédito', icon: CreditCard },
  { type: 'fund', label: 'Fundos', icon: TrendingUp },
];

export default function Products() {
  const [activeType, setActiveType] = useState<ProductType>('term_deposit');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<FinancialProduct | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [simulatedAmount, setSimulatedAmount] = useState<number | undefined>();
  const [simulatedTermDays, setSimulatedTermDays] = useState<number | undefined>();

  const { data: products, isLoading } = useFinancialProducts(activeType);

  const handleSimulate = (product: FinancialProduct) => {
    setSelectedProduct(product);
    setShowSimulator(true);
    setShowRequestForm(false);
  };

  const handleRequest = (product: FinancialProduct) => {
    setSelectedProduct(product);
    setShowRequestForm(true);
    setShowSimulator(false);
  };

  const handleRequestFromSimulator = (amount: number, termDays: number) => {
    setSimulatedAmount(amount);
    setSimulatedTermDays(termDays);
    setShowSimulator(false);
    setShowRequestForm(true);
  };

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
    setSelectedProduct(null);
    setSimulatedAmount(undefined);
    setSimulatedTermDays(undefined);
  };

  return (
    <>
      <Helmet>
        <title>Produtos Financeiros | Finança Pessoal</title>
        <meta name="description" content="Compare e solicite produtos financeiros: depósitos a prazo, seguros, microcrédito e fundos de investimento." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Produtos Financeiros</h1>
          <p className="text-muted-foreground">
            Compare taxas, simule retornos e solicite os melhores produtos financeiros.
          </p>
        </div>

        <Tabs defaultValue="catalog" className="space-y-6">
          <TabsList>
            <TabsTrigger value="catalog">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Catálogo
            </TabsTrigger>
            <TabsTrigger value="requests">
              <FileText className="h-4 w-4 mr-2" />
              Minhas Solicitações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            {/* Product Type Tabs */}
            <div className="flex flex-wrap gap-2">
              {productTypes.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant={activeType === type ? 'default' : 'outline'}
                  onClick={() => setActiveType(type)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex justify-end gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products?.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSimulate={
                      product.product_type === 'term_deposit' || product.product_type === 'microcredit'
                        ? () => handleSimulate(product)
                        : undefined
                    }
                    onRequest={() => handleRequest(product)}
                  />
                ))}
              </div>
            ) : (
              <ProductComparison
                products={products || []}
                onSelect={handleRequest}
              />
            )}
          </TabsContent>

          <TabsContent value="requests">
            <MyRequests />
          </TabsContent>
        </Tabs>

        {/* Simulator Dialog */}
        <Dialog open={showSimulator} onOpenChange={setShowSimulator}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Simulador de Investimento</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <ProductSimulator
                product={selectedProduct}
                onRequest={handleRequestFromSimulator}
                onClose={() => setShowSimulator(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Request Form Dialog */}
        <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Solicitação</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <ProductRequestForm
                product={selectedProduct}
                initialAmount={simulatedAmount}
                initialTermDays={simulatedTermDays}
                onSuccess={handleRequestSuccess}
                onCancel={() => setShowRequestForm(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
