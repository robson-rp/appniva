import { Link } from 'react-router-dom';
import { Scale, ArrowRight, Building } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReconciliationSelect() {
  const { data: accounts, isLoading } = useAccounts();

  const activeAccounts = accounts?.filter((a) => a.is_active) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reconciliação Bancária</h1>
        <p className="text-muted-foreground">
          Selecione uma conta para iniciar a reconciliação com extratos bancários.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : activeAccounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scale className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma conta ativa encontrada.
              <br />
              Crie uma conta primeiro para usar a reconciliação.
            </p>
            <Link
              to="/accounts"
              className="mt-4 text-primary hover:underline"
            >
              Ir para Contas
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeAccounts.map((account) => (
            <Link key={account.id} to={`/reconciliation/${account.id}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {account.institution_name || account.account_type}
                        </CardDescription>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {account.current_balance.toLocaleString('pt-AO', {
                      style: 'currency',
                      currency: account.currency || 'AOA',
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clique para reconciliar esta conta
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
