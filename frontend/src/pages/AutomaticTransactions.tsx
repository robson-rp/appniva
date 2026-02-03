import { useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  CreditCard, 
  GraduationCap, 
  Send, 
  Users, 
  Target, 
  TrendingUp, 
  Repeat,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAutomaticTransactions,
  useAutomaticTransactionStats,
  TransactionSource,
  SOURCE_LABELS,
  SOURCE_COLORS,
} from "@/hooks/useAutomaticTransactions";

const SOURCE_ICONS: Record<TransactionSource, React.ReactNode> = {
  debt_payment: <CreditCard className="h-4 w-4" />,
  school_fee: <GraduationCap className="h-4 w-4" />,
  remittance: <Send className="h-4 w-4" />,
  kixikila: <Users className="h-4 w-4" />,
  goal_contribution: <Target className="h-4 w-4" />,
  investment: <TrendingUp className="h-4 w-4" />,
  subscription: <Repeat className="h-4 w-4" />,
};

function formatCurrency(value: number, currency: string = 'AOA') {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AutomaticTransactions() {
  const [sourceFilter, setSourceFilter] = useState<TransactionSource | 'all'>('all');
  
  const { data: transactions, isLoading } = useAutomaticTransactions(
    sourceFilter !== 'all' ? { source: sourceFilter } : undefined
  );
  const { data: stats, isLoading: statsLoading } = useAutomaticTransactionStats();

  const totalTransactions = transactions?.length ?? 0;
  const totalAmount = transactions?.reduce((acc, tx) => acc + Number(tx.amount), 0) ?? 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transações Automáticas</h1>
          <p className="text-muted-foreground">
            Transações geradas automaticamente pelos diferentes módulos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statsLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          Object.entries(SOURCE_LABELS).map(([source, label]) => {
            const sourceKey = source as TransactionSource;
            const stat = stats?.[sourceKey] ?? { count: 0, total: 0 };
            
            return (
              <Card 
                key={source}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  sourceFilter === source ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSourceFilter(sourceFilter === sourceKey ? 'all' : sourceKey)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="p-1.5 rounded-full"
                      style={{ backgroundColor: `${SOURCE_COLORS[sourceKey]}20` }}
                    >
                      <span style={{ color: SOURCE_COLORS[sourceKey] }}>
                        {SOURCE_ICONS[sourceKey]}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{label}</p>
                  <p className="text-lg font-bold">{stat.count}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTransactions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Volume Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select 
          value={sourceFilter} 
          onValueChange={(v) => setSourceFilter(v as TransactionSource | 'all')}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Módulos</SelectItem>
            {Object.entries(SOURCE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sourceFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setSourceFilter('all')}>
            Limpar filtro
          </Button>
        )}
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : transactions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma transação automática encontrada</p>
              <p className="text-sm">
                As transações aparecerão aqui quando forem geradas pelos módulos
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(tx.date), "dd/MM/yyyy", { locale: pt })}
                    </TableCell>
                    <TableCell>
                      {tx.source && (
                        <Badge 
                          variant="outline"
                          className="gap-1"
                          style={{ 
                            borderColor: SOURCE_COLORS[tx.source],
                            color: SOURCE_COLORS[tx.source]
                          }}
                        >
                          {SOURCE_ICONS[tx.source]}
                          <span className="hidden sm:inline">
                            {SOURCE_LABELS[tx.source]}
                          </span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {tx.description}
                    </TableCell>
                    <TableCell>{tx.account?.name ?? '-'}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <span className={`flex items-center justify-end gap-1 ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
