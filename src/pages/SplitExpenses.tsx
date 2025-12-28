import { useState } from 'react';
import { 
  Split, 
  Plus, 
  Users,
  CheckCircle2,
  Circle,
  Trash2,
  DollarSign,
  Phone,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  useSplitExpenses, 
  useSplitExpenseStats,
  useCreateSplitExpense, 
  useRecordPayment,
  useSettleSplitExpense,
  useDeleteSplitExpense,
  SplitExpenseWithParticipants,
} from '@/hooks/useSplitExpenses';
import { formatCurrency, formatDate, CURRENCIES } from '@/lib/constants';

function ExpenseDetails({ expense, onClose }: { expense: SplitExpenseWithParticipants; onClose: () => void }) {
  const recordPayment = useRecordPayment();
  const settleExpense = useSettleSplitExpense();
  const [paymentAmount, setPaymentAmount] = useState<Record<string, string>>({});

  const totalOwed = expense.participants
    .filter(p => !p.is_creator)
    .reduce((sum, p) => sum + (p.amount_owed - p.amount_paid), 0);
  
  const totalPaid = expense.participants
    .filter(p => !p.is_creator)
    .reduce((sum, p) => sum + p.amount_paid, 0);

  const allPaid = expense.participants.every(p => p.amount_paid >= p.amount_owed);

  const handleRecordPayment = async (participantId: string) => {
    const amount = parseFloat(paymentAmount[participantId] || '0');
    if (amount > 0) {
      await recordPayment.mutateAsync({ participantId, amount });
      setPaymentAmount(p => ({ ...p, [participantId]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{expense.description}</h3>
          <p className="text-sm text-muted-foreground">{formatDate(expense.expense_date)}</p>
        </div>
        <Badge variant={expense.is_settled ? 'default' : 'secondary'}>
          {expense.is_settled ? 'Liquidada' : 'Pendente'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{formatCurrency(expense.total_amount, expense.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Por Receber</p>
            <p className="text-xl font-bold text-orange-500">{formatCurrency(totalOwed, expense.currency)}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Participantes</h4>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(totalPaid, expense.currency)} de {formatCurrency(expense.total_amount - expense.participants.find(p => p.is_creator)!.amount_owed, expense.currency)} recebido
          </p>
        </div>
        {totalPaid > 0 && (
          <Progress value={(totalPaid / (expense.total_amount - expense.participants.find(p => p.is_creator)!.amount_owed)) * 100} className="mb-4" />
        )}
        <div className="space-y-3">
          {expense.participants.map((participant) => {
            const owes = participant.amount_owed - participant.amount_paid;
            const hasPaidAll = owes <= 0;
            return (
              <div 
                key={participant.id} 
                className={`p-4 rounded-lg border ${participant.is_creator ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {hasPaidAll ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">
                        {participant.name}
                        {participant.is_creator && <Badge className="ml-2">Você (pagou)</Badge>}
                      </p>
                      <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                        {participant.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {participant.phone}
                          </span>
                        )}
                        {participant.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {participant.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(participant.amount_owed, expense.currency)}</p>
                    {!participant.is_creator && (
                      <p className={`text-sm ${hasPaidAll ? 'text-green-500' : 'text-orange-500'}`}>
                        {hasPaidAll ? 'Pago' : `Deve: ${formatCurrency(owes, expense.currency)}`}
                      </p>
                    )}
                  </div>
                </div>
                {!participant.is_creator && !hasPaidAll && !expense.is_settled && (
                  <div className="flex gap-2 mt-3">
                    <Input
                      type="number"
                      placeholder="Valor"
                      value={paymentAmount[participant.id] || ''}
                      onChange={(e) => setPaymentAmount(p => ({ ...p, [participant.id]: e.target.value }))}
                      className="w-32"
                    />
                    <Button 
                      size="sm"
                      onClick={() => handleRecordPayment(participant.id)}
                      disabled={!paymentAmount[participant.id] || recordPayment.isPending}
                    >
                      Registar Pagamento
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPaymentAmount(p => ({ ...p, [participant.id]: owes.toString() }));
                      }}
                    >
                      Total
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {allPaid && !expense.is_settled && (
        <Button onClick={() => settleExpense.mutate(expense.id)} className="w-full" disabled={settleExpense.isPending}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Marcar como Liquidada
        </Button>
      )}
    </div>
  );
}

export default function SplitExpenses() {
  const { data: expenses = [], isLoading } = useSplitExpenses();
  const stats = useSplitExpenseStats();
  const createExpense = useCreateSplitExpense();
  const deleteExpense = useDeleteSplitExpense();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<SplitExpenseWithParticipants | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    description: '',
    total_amount: '',
    currency: 'AOA',
    expense_date: new Date().toISOString().split('T')[0],
    category: '',
    participants: [{ name: '', phone: '', email: '', is_creator: true }],
    split_equally: true,
  });

  const addParticipant = () => {
    setFormData(p => ({
      ...p,
      participants: [...p.participants, { name: '', phone: '', email: '', is_creator: false }],
    }));
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    setFormData(p => ({
      ...p,
      participants: p.participants.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  };

  const removeParticipant = (index: number) => {
    if (formData.participants.length > 1) {
      setFormData(p => ({
        ...p,
        participants: p.participants.filter((_, i) => i !== index),
      }));
    }
  };

  const handleCreate = async () => {
    const total = parseFloat(formData.total_amount);
    const perPerson = total / formData.participants.length;
    
    await createExpense.mutateAsync({
      expense: {
        description: formData.description,
        total_amount: total,
        currency: formData.currency,
        expense_date: formData.expense_date,
        category: formData.category || null,
        is_settled: false,
      },
      participants: formData.participants.map(p => ({
        name: p.name,
        phone: p.phone || undefined,
        email: p.email || undefined,
        amount_owed: perPerson,
        is_creator: p.is_creator,
      })),
    });
    setCreateOpen(false);
    setFormData({
      description: '',
      total_amount: '',
      currency: 'AOA',
      expense_date: new Date().toISOString().split('T')[0],
      category: '',
      participants: [{ name: '', phone: '', email: '', is_creator: true }],
      split_equally: true,
    });
  };

  const activeExpenses = expenses.filter(e => !e.is_settled);
  const settledExpenses = expenses.filter(e => e.is_settled);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Divisão de Despesas</h1>
          <p className="text-muted-foreground">Partilhar contas com amigos e família</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dividir Nova Despesa</DialogTitle>
              <DialogDescription>Crie uma despesa para dividir com outras pessoas.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input 
                  placeholder="Ex: Jantar no restaurante"
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Valor Total</Label>
                  <Input 
                    type="number"
                    placeholder="50000"
                    value={formData.total_amount}
                    onChange={(e) => setFormData(p => ({ ...p, total_amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData(p => ({ ...p, currency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input 
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData(p => ({ ...p, expense_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Participantes</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formData.total_amount && formData.participants.length > 0 
                        ? `${formatCurrency(parseFloat(formData.total_amount) / formData.participants.length, formData.currency)} cada`
                        : ''}
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
                      <Plus className="mr-1 h-3 w-3" /> Adicionar
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {formData.participants.map((participant, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input 
                        placeholder="Nome"
                        value={participant.name}
                        onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input 
                        placeholder="Telefone"
                        value={participant.phone}
                        onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                        className="w-28"
                      />
                      <Input 
                        placeholder="Email"
                        value={participant.email}
                        onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                        className="w-36"
                      />
                      {index === 0 && <Badge className="shrink-0">Você</Badge>}
                      {formData.participants.length > 1 && index !== 0 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeParticipant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleCreate} 
                disabled={!formData.description || !formData.total_amount || formData.participants.some(p => !p.name) || createExpense.isPending}
                className="w-full"
              >
                {createExpense.isPending ? 'A criar...' : 'Criar Despesa Partilhada'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Por Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-500">{formatCurrency(stats.totalOwed, 'AOA')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Já Liquidado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.totalSettled, 'AOA')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Split className="h-4 w-4" />
              Despesas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.activeExpenses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalExpenses}</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas Partilhadas</CardTitle>
          <CardDescription>Lista de todas as despesas divididas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <Split className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhuma Despesa</h3>
              <p className="text-muted-foreground mb-4">Crie a sua primeira despesa partilhada.</p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">Pendentes ({activeExpenses.length})</TabsTrigger>
                <TabsTrigger value="settled">Liquidadas ({settledExpenses.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="active">
                <div className="space-y-3">
                  {activeExpenses.map((expense) => {
                    const owed = expense.participants
                      .filter(p => !p.is_creator)
                      .reduce((sum, p) => sum + (p.amount_owed - p.amount_paid), 0);
                    return (
                      <div 
                        key={expense.id} 
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border gap-4 cursor-pointer hover:border-primary"
                        onClick={() => setSelectedExpense(expense)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Split className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {expense.participants.length} participantes • {formatDate(expense.expense_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(expense.total_amount, expense.currency)}</p>
                            <p className="text-sm text-orange-500">Por receber: {formatCurrency(owed, expense.currency)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(expense.id); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="settled">
                <div className="space-y-3">
                  {settledExpenses.map((expense) => (
                    <div 
                      key={expense.id} 
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border gap-4 opacity-75 cursor-pointer"
                      onClick={() => setSelectedExpense(expense)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.participants.length} participantes • {formatDate(expense.expense_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-500">{formatCurrency(expense.total_amount, expense.currency)}</p>
                          <Badge variant="outline" className="text-green-500">Liquidada</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); setDeleteId(expense.id); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedExpense && (
            <ExpenseDetails expense={selectedExpense} onClose={() => setSelectedExpense(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteExpense.mutate(deleteId!); setDeleteId(null); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
