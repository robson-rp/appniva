import { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  School,
  Clock,
  FileDown,
  Receipt,
  Copy,
  Edit,
  BarChart3,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  useSchoolFees, 
  useSchoolFeeStats,
  useCreateSchoolFee, 
  useMarkSchoolFeePaid,
  useDeleteSchoolFee,
  useUpdateSchoolFee,
  EDUCATION_LEVELS,
  FEE_TYPES,
  TERMS,
  SchoolFee,
} from '@/hooks/useSchoolFees';
import { formatCurrency, formatDate, CURRENCIES } from '@/lib/constants';
import { SchoolFeeEvolutionChart } from '@/components/school-fees/SchoolFeeEvolutionChart';
import { SchoolFeeCalendar } from '@/components/school-fees/SchoolFeeCalendar';
import { SchoolFeeTimeline } from '@/components/school-fees/SchoolFeeTimeline';
import { SchoolFeeTypeChart } from '@/components/school-fees/SchoolFeeTypeChart';
import { SchoolFeeStats } from '@/components/school-fees/SchoolFeeStats';
import { generateSchoolFeesPDF, generatePaymentReceipt } from '@/components/school-fees/SchoolFeePDFExport';

type ViewMode = 'list' | 'school' | 'charts';

export default function SchoolFees() {
  const { data: fees = [], isLoading } = useSchoolFees();
  const stats = useSchoolFeeStats();
  const createFee = useCreateSchoolFee();
  const markPaid = useMarkSchoolFeePaid();
  const deleteFee = useDeleteSchoolFee();
  const updateFee = useUpdateSchoolFee();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editFee, setEditFee] = useState<SchoolFee | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  const currentYear = new Date().getFullYear();
  const academicYears = [`${currentYear}/${currentYear + 1}`, `${currentYear - 1}/${currentYear}`, `${currentYear + 1}/${currentYear + 2}`];
  
  const [formData, setFormData] = useState({
    student_name: '',
    school_name: '',
    education_level: 'primary' as const,
    fee_type: 'tuition' as const,
    amount: '',
    currency: 'AOA',
    academic_year: academicYears[0],
    term: '1' as const,
    due_date: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      student_name: '',
      school_name: '',
      education_level: 'primary',
      fee_type: 'tuition',
      amount: '',
      currency: 'AOA',
      academic_year: academicYears[0],
      term: '1',
      due_date: '',
      notes: '',
    });
  };

  const handleCreate = async () => {
    await createFee.mutateAsync({
      student_name: formData.student_name,
      school_name: formData.school_name,
      education_level: formData.education_level,
      fee_type: formData.fee_type,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      academic_year: formData.academic_year,
      term: formData.term,
      due_date: formData.due_date,
      paid: false,
      paid_date: null,
      account_id: null,
      notes: formData.notes || null,
    });
    setCreateOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!editFee) return;
    await updateFee.mutateAsync({
      id: editFee.id,
      student_name: formData.student_name,
      school_name: formData.school_name,
      education_level: formData.education_level,
      fee_type: formData.fee_type,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      academic_year: formData.academic_year,
      term: formData.term,
      due_date: formData.due_date,
      notes: formData.notes || null,
    });
    setEditFee(null);
    resetForm();
  };

  const handleDuplicate = async (fee: SchoolFee) => {
    // Get next term or next year
    const currentTermIndex = TERMS.findIndex(t => t.value === fee.term);
    let nextTerm = fee.term;
    let nextYear = fee.academic_year;
    
    if (currentTermIndex < TERMS.length - 2) {
      nextTerm = TERMS[currentTermIndex + 1].value as '1' | '2' | '3' | 'annual';
    } else {
      // Move to next year, first term
      const [startYear] = fee.academic_year.split('/').map(Number);
      nextYear = `${startYear + 1}/${startYear + 2}`;
      nextTerm = '1';
    }

    await createFee.mutateAsync({
      student_name: fee.student_name,
      school_name: fee.school_name,
      education_level: fee.education_level as any,
      fee_type: fee.fee_type as any,
      amount: fee.amount,
      currency: fee.currency,
      academic_year: nextYear,
      term: nextTerm,
      due_date: '', // User should set new date
      paid: false,
      paid_date: null,
      account_id: null,
      notes: fee.notes,
    });
  };

  const openEditDialog = (fee: SchoolFee) => {
    setFormData({
      student_name: fee.student_name,
      school_name: fee.school_name,
      education_level: fee.education_level as any,
      fee_type: fee.fee_type as any,
      amount: fee.amount.toString(),
      currency: fee.currency,
      academic_year: fee.academic_year,
      term: (fee.term || '1') as any,
      due_date: fee.due_date,
      notes: fee.notes || '',
    });
    setEditFee(fee);
  };

  const unpaidFees = fees.filter(f => !f.paid);
  const paidFees = fees.filter(f => f.paid);

  // Group by school
  const feesBySchool = fees.reduce((acc, fee) => {
    if (!acc[fee.school_name]) acc[fee.school_name] = [];
    acc[fee.school_name].push(fee);
    return acc;
  }, {} as Record<string, SchoolFee[]>);

  const FeeForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome do Estudante</Label>
          <Input 
            placeholder="Nome do aluno"
            value={formData.student_name}
            onChange={(e) => setFormData(p => ({ ...p, student_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Escola</Label>
          <Input 
            placeholder="Nome da escola"
            value={formData.school_name}
            onChange={(e) => setFormData(p => ({ ...p, school_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Nível de Ensino</Label>
          <Select value={formData.education_level} onValueChange={(v: any) => setFormData(p => ({ ...p, education_level: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map(l => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo de Despesa</Label>
          <Select value={formData.fee_type} onValueChange={(v: any) => setFormData(p => ({ ...p, fee_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FEE_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Valor</Label>
          <Input 
            type="number"
            placeholder="150000"
            value={formData.amount}
            onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
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
          <Label>Ano Lectivo</Label>
          <Select value={formData.academic_year} onValueChange={(v) => setFormData(p => ({ ...p, academic_year: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {academicYears.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Trimestre</Label>
          <Select value={formData.term} onValueChange={(v: any) => setFormData(p => ({ ...p, term: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TERMS.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Data de Vencimento</Label>
          <Input 
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData(p => ({ ...p, due_date: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notas (opcional)</Label>
        <Textarea 
          placeholder="Notas adicionais..."
          value={formData.notes}
          onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
        />
      </div>

      <Button 
        onClick={isEdit ? handleEdit : handleCreate} 
        disabled={!formData.student_name || !formData.school_name || !formData.amount || !formData.due_date || (isEdit ? updateFee.isPending : createFee.isPending)}
        className="w-full"
      >
        {isEdit 
          ? (updateFee.isPending ? 'A guardar...' : 'Guardar Alterações')
          : (createFee.isPending ? 'A registar...' : 'Registar Propina')
        }
      </Button>
    </div>
  );

  const FeeItem = ({ fee, showSchool = true }: { fee: SchoolFee; showSchool?: boolean }) => {
    const isOverdue = !fee.paid && new Date(fee.due_date) < new Date();
    
    return (
      <div 
        className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border gap-4 ${
          fee.paid 
            ? 'opacity-75' 
            : isOverdue 
              ? 'border-destructive bg-destructive/5' 
              : ''
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            fee.paid 
              ? 'bg-green-100 dark:bg-green-950' 
              : 'bg-primary/10'
          }`}>
            {fee.paid ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <GraduationCap className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium">{fee.student_name}</p>
            {showSchool && <p className="text-sm text-muted-foreground">{fee.school_name}</p>}
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline">{EDUCATION_LEVELS.find(l => l.value === fee.education_level)?.label}</Badge>
              <Badge variant="secondary">{FEE_TYPES.find(t => t.value === fee.fee_type)?.label}</Badge>
              <Badge variant="secondary">{fee.academic_year} - {TERMS.find(t => t.value === fee.term)?.label}</Badge>
              {isOverdue && <Badge variant="destructive">Em atraso</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-lg font-bold ${fee.paid ? 'text-green-500' : ''}`}>
              {formatCurrency(fee.amount, fee.currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              {fee.paid 
                ? `Pago: ${fee.paid_date ? formatDate(fee.paid_date) : '-'}`
                : `Vence: ${formatDate(fee.due_date)}`
              }
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!fee.paid && (
                <DropdownMenuItem onClick={() => markPaid.mutate(fee.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marcar como Pago
                </DropdownMenuItem>
              )}
              {fee.paid && (
                <DropdownMenuItem onClick={() => generatePaymentReceipt(fee)}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Gerar Recibo
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => openEditDialog(fee)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(fee)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteId(fee.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Propinas Escolares</h1>
          <p className="text-muted-foreground">Gestão de despesas educacionais por período</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => generateSchoolFeesPDF(fees)}>
                Todas as Propinas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generateSchoolFeesPDF(paidFees, undefined, 'Propinas Pagas')}>
                Apenas Pagas
              </DropdownMenuItem>
              {Object.keys(stats.byStudent).map(name => (
                <DropdownMenuItem key={name} onClick={() => generateSchoolFeesPDF(fees, name)}>
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Propina
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registar Nova Propina</DialogTitle>
                <DialogDescription>Adicione uma nova despesa escolar.</DialogDescription>
              </DialogHeader>
              <FeeForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Por Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-500">{formatCurrency(stats.totalDue, 'AOA')}</p>
            <p className="text-xs text-muted-foreground">{unpaidFees.length} propinas pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.totalPaid, 'AOA')}</p>
            <p className="text-xs text-muted-foreground">{paidFees.length} propinas pagas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Em Atraso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
            <p className="text-xs text-muted-foreground">propinas vencidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Próximos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.upcoming}</p>
            <p className="text-xs text-muted-foreground">propinas a vencer</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="school" className="gap-2">
            <Building2 className="h-4 w-4" />
            Por Escola
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6 mt-6">
          {/* Per Student Summary */}
          {Object.keys(stats.byStudent).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo por Estudante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(stats.byStudent).map(([name, data]) => (
                    <div key={name} className="p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <p className="font-medium">{name}</p>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">{formatCurrency(data.total, 'AOA')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pago:</span>
                          <span className="text-green-500">{formatCurrency(data.paid, 'AOA')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Por pagar:</span>
                          <span className="text-orange-500">{formatCurrency(data.due, 'AOA')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fees List */}
          <Card>
            <CardHeader>
              <CardTitle>Propinas</CardTitle>
              <CardDescription>Lista de todas as despesas escolares</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : fees.length === 0 ? (
                <div className="text-center py-8">
                  <School className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Nenhuma Propina</h3>
                  <p className="text-muted-foreground mb-4">Registe a sua primeira despesa escolar.</p>
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Registar Propina
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue="pending">
                  <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pendentes ({unpaidFees.length})</TabsTrigger>
                    <TabsTrigger value="paid">Pagas ({paidFees.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pending">
                    <div className="space-y-3">
                      {unpaidFees.map(fee => <FeeItem key={fee.id} fee={fee} />)}
                    </div>
                  </TabsContent>
                  <TabsContent value="paid">
                    <div className="space-y-3">
                      {paidFees.map(fee => <FeeItem key={fee.id} fee={fee} />)}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="school" className="space-y-6 mt-6">
          {Object.entries(feesBySchool).map(([school, schoolFees]) => {
            const schoolTotal = schoolFees.reduce((sum, f) => sum + f.amount, 0);
            const schoolPaid = schoolFees.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0);
            
            return (
              <Card key={school}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{school}</CardTitle>
                        <CardDescription>{schoolFees.length} propinas</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(schoolTotal, 'AOA')}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="text-green-500">{formatCurrency(schoolPaid, 'AOA')}</span> pago
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schoolFees.map(fee => <FeeItem key={fee.id} fee={fee} showSchool={false} />)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="charts" className="space-y-6 mt-6">
          <SchoolFeeStats fees={fees} currency="AOA" />
          
          <div className="grid gap-6 lg:grid-cols-2">
            <SchoolFeeEvolutionChart fees={fees} currency="AOA" />
            <SchoolFeeTypeChart fees={fees} currency="AOA" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SchoolFeeCalendar fees={fees} />
            <SchoolFeeTimeline fees={fees} academicYear={academicYears[0]} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editFee} onOpenChange={() => { setEditFee(null); resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Propina</DialogTitle>
            <DialogDescription>Modifique os dados da propina.</DialogDescription>
          </DialogHeader>
          <FeeForm isEdit />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Propina?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteFee.mutate(deleteId!); setDeleteId(null); }}
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
