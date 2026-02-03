import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdminUserData } from '@/hooks/useAdminUserData';
import { 
  Loader2, Wallet, ArrowLeftRight, CreditCard, TrendingUp, Target, 
  X, ArrowDownCircle, ArrowUpCircle, RefreshCw, Gauge
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  primary_currency: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
}

interface AdminUserDetailsProps {
  user: UserProfile;
  onClose: () => void;
}

export function AdminUserDetails({ user, onClose }: AdminUserDetailsProps) {
  const { accounts, transactions, debts, investments, goals, financialScore, isLoading } = useAdminUserData(user.id);

  const formatCurrency = (amount: number, currency: string = 'AOA') => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0);
  const totalDebt = debts.filter(d => d.status === 'active').reduce((sum, d) => sum + Number(d.current_balance), 0);
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.principal_amount), 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{user.primary_currency || 'AOA'}</Badge>
              <Badge variant={user.onboarding_completed ? 'default' : 'secondary'}>
                {user.onboarding_completed ? 'Activo' : 'Onboarding Pendente'}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  Saldo Total
                </div>
                <p className="text-lg font-bold">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  Dívidas
                </div>
                <p className="text-lg font-bold text-destructive">{formatCurrency(totalDebt)}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Investido
                </div>
                <p className="text-lg font-bold text-primary">{formatCurrency(totalInvested)}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gauge className="h-4 w-4" />
                  Score
                </div>
                <p className="text-lg font-bold">
                  {financialScore ? `${financialScore.score}/100` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Data Tabs */}
            <Tabs defaultValue="accounts" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="accounts" className="gap-1">
                  <Wallet className="h-3 w-3" />
                  Contas ({accounts.length})
                </TabsTrigger>
                <TabsTrigger value="transactions" className="gap-1">
                  <ArrowLeftRight className="h-3 w-3" />
                  Transacções ({transactions.length})
                </TabsTrigger>
                <TabsTrigger value="debts" className="gap-1">
                  <CreditCard className="h-3 w-3" />
                  Dívidas ({debts.length})
                </TabsTrigger>
                <TabsTrigger value="investments" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Invest. ({investments.length})
                </TabsTrigger>
                <TabsTrigger value="goals" className="gap-1">
                  <Target className="h-3 w-3" />
                  Metas ({goals.length})
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[400px] mt-4">
                <TabsContent value="accounts" className="mt-0">
                  {accounts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Instituição</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((acc) => (
                          <TableRow key={acc.id}>
                            <TableCell className="font-medium">{acc.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{acc.account_type}</Badge>
                            </TableCell>
                            <TableCell>{acc.institution_name || '-'}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(acc.current_balance, acc.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Sem contas registadas</p>
                  )}
                </TabsContent>

                <TabsContent value="transactions" className="mt-0">
                  {transactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx: any) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(tx.date), 'dd/MM/yy')}
                            </TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {tx.description || '-'}
                            </TableCell>
                            <TableCell>
                              {tx.type === 'income' && <ArrowDownCircle className="h-4 w-4 text-income" />}
                              {tx.type === 'expense' && <ArrowUpCircle className="h-4 w-4 text-expense" />}
                              {tx.type === 'transfer' && <RefreshCw className="h-4 w-4 text-muted-foreground" />}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${
                              tx.type === 'income' ? 'text-income' : tx.type === 'expense' ? 'text-expense' : ''
                            }`}>
                              {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                              {formatCurrency(tx.amount, tx.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Sem transacções</p>
                  )}
                </TabsContent>

                <TabsContent value="debts" className="mt-0">
                  {debts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {debts.map((debt) => (
                          <TableRow key={debt.id}>
                            <TableCell className="font-medium">{debt.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{debt.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={debt.status === 'active' ? 'destructive' : 'secondary'}>
                                {debt.status === 'active' ? 'Activa' : 'Fechada'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(debt.current_balance, debt.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Sem dívidas</p>
                  )}
                </TabsContent>

                <TabsContent value="investments" className="mt-0">
                  {investments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Instituição</TableHead>
                          <TableHead className="text-right">Capital</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {investments.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-medium">{inv.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{inv.investment_type}</Badge>
                            </TableCell>
                            <TableCell>{inv.institution_name || '-'}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(inv.principal_amount, inv.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Sem investimentos</p>
                  )}
                </TabsContent>

                <TabsContent value="goals" className="mt-0">
                  {goals.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Meta</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Progresso</TableHead>
                          <TableHead className="text-right">Objectivo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {goals.map((goal) => {
                          const progress = Math.min(100, (Number(goal.current_saved_amount) / Number(goal.target_amount)) * 100);
                          return (
                            <TableRow key={goal.id}>
                              <TableCell className="font-medium">{goal.name}</TableCell>
                              <TableCell>
                                <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                                  {goal.status === 'in_progress' ? 'Em Curso' : goal.status === 'completed' ? 'Concluída' : 'Cancelada'}
                                </Badge>
                              </TableCell>
                              <TableCell>{progress.toFixed(0)}%</TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(goal.target_amount, goal.currency)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Sem metas</p>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
