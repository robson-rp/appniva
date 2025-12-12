import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAdminProducts, useDeleteProduct } from '@/hooks/useAdminProducts';
import { AdminProductForm } from './AdminProductForm';
import { FinancialProduct, ProductType } from '@/hooks/useFinancialProducts';
import { Loader2, Plus, Pencil, Trash2, Search, Package } from 'lucide-react';

const typeLabels: Record<ProductType, string> = {
  term_deposit: 'Depósito a Prazo',
  insurance: 'Seguro',
  microcredit: 'Microcrédito',
  fund: 'Fundo',
};

export function AdminProductList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FinancialProduct | undefined>();

  const { data: products, isLoading } = useAdminProducts();
  const deleteProduct = useDeleteProduct();

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.institution_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product: FinancialProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produtos Financeiros
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Instituição</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeLabels[product.product_type]}</Badge>
                      </TableCell>
                      <TableCell>{product.institution_name}</TableCell>
                      <TableCell>
                        {product.interest_rate_annual !== null ? `${product.interest_rate_annual}%` : '-'}
                      </TableCell>
                      <TableCell>{formatCurrency(product.min_amount, product.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar Produto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acção não pode ser revertida. O produto "{product.name}" será eliminado permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProduct.mutate(product.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {searchQuery ? 'Nenhum produto encontrado.' : 'Ainda não há produtos cadastrados.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto Financeiro'}
            </DialogTitle>
          </DialogHeader>
          <AdminProductForm
            product={editingProduct}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
