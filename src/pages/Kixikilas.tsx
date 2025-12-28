import { useState } from 'react';
import { 
  Users, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Circle,
  Trash2,
  ChevronRight,
  Play,
  Pause,
  Edit,
  MessageCircle,
  GripVertical,
  ArrowUp,
  ArrowDown,
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
import { 
  useKixikilas, 
  useKixikilaMembers, 
  useKixikilaContributions,
  useCreateKixikila, 
  useAddKixikilaContribution,
  useUpdateKixikilaRound,
  useDeleteKixikila,
  useUpdateKixikila,
  useUpdateMemberOrder,
} from '@/hooks/useKixikilas';
import { formatCurrency, CURRENCIES } from '@/lib/constants';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { KixikilaProgressChart } from '@/components/kixikila/KixikilaProgressChart';
import { KixikilaStats } from '@/components/kixikila/KixikilaStats';
import { KixikilaCalendar } from '@/components/kixikila/KixikilaCalendar';
import { KixikilaHistory } from '@/components/kixikila/KixikilaHistory';

const FREQUENCIES = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
];

function KixikilaDetails({ kixikilaId, onClose }: { kixikilaId: string; onClose: () => void }) {
  const { data: members = [] } = useKixikilaMembers(kixikilaId);
  const { data: contributions = [] } = useKixikilaContributions(kixikilaId);
  const addContribution = useAddKixikilaContribution();
  const { data: kixikilas = [] } = useKixikilas();
  const updateRound = useUpdateKixikilaRound();
  const updateKixikila = useUpdateKixikila();
  const updateMemberOrder = useUpdateMemberOrder();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  
  const kixikila = kixikilas.find(k => k.id === kixikilaId);
  if (!kixikila) return null;

  const currentRoundContributions = contributions.filter(c => c.round_number === kixikila.current_round);
  const paidMemberIds = new Set(currentRoundContributions.map(c => c.member_id));
  const currentRecipient = members.find(m => m.order_number === kixikila.current_round);
  const allPaid = members.every(m => paidMemberIds.has(m.id));

  const handleMarkPaid = async (memberId: string) => {
    await addContribution.mutateAsync({
      kixikila_id: kixikilaId,
      member_id: memberId,
      round_number: kixikila.current_round,
      amount: kixikila.contribution_amount,
      notes: null,
    });
  };

  const handleAdvanceRound = async () => {
    if (kixikila.current_round < kixikila.total_members) {
      await updateRound.mutateAsync({
        id: kixikilaId,
        current_round: kixikila.current_round + 1,
      });
    }
  };

  const handleTogglePause = async () => {
    await updateKixikila.mutateAsync({
      id: kixikilaId,
      status: kixikila.status === 'active' ? 'paused' : 'active',
    });
  };

  const handleSaveEdit = async () => {
    await updateKixikila.mutateAsync({
      id: kixikilaId,
      name: editName,
      description: editDescription || null,
      contribution_amount: parseFloat(editAmount),
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditName(kixikila.name);
    setEditDescription(kixikila.description || '');
    setEditAmount(kixikila.contribution_amount.toString());
    setIsEditing(true);
  };

  const handleMoveMember = async (memberId: string, direction: 'up' | 'down') => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    const newOrder = direction === 'up' ? member.order_number - 1 : member.order_number + 1;
    if (newOrder < 1 || newOrder > members.length) return;
    
    const otherMember = members.find(m => m.order_number === newOrder);
    if (!otherMember) return;
    
    await updateMemberOrder.mutateAsync({
      members: [
        { id: member.id, order_number: newOrder },
        { id: otherMember.id, order_number: member.order_number },
      ],
    });
  };

  const handleWhatsAppReminder = (member: { name: string; phone: string | null }) => {
    if (!member.phone) return;
    const message = encodeURIComponent(
      `Olá ${member.name}! 👋\n\nLembrete: A sua contribuição de ${formatCurrency(kixikila.contribution_amount, kixikila.currency)} para a Kixikila "${kixikila.name}" está pendente.\n\nObrigado! 🙏`
    );
    window.open(`https://wa.me/${member.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        {isEditing ? (
          <div className="flex-1 space-y-3">
            <Input 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nome da Kixikila"
            />
            <Input 
              value={editDescription} 
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Descrição"
            />
            <Input 
              type="number"
              value={editAmount} 
              onChange={(e) => setEditAmount(e.target.value)}
              placeholder="Valor da contribuição"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} disabled={updateKixikila.isPending}>
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-semibold">{kixikila.name}</h3>
              <p className="text-sm text-muted-foreground">{kixikila.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={handleStartEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant={kixikila.status === 'active' ? 'outline' : 'default'}
                onClick={handleTogglePause}
                disabled={updateKixikila.isPending}
              >
                {kixikila.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Badge variant={kixikila.status === 'active' ? 'default' : kixikila.status === 'paused' ? 'secondary' : 'outline'}>
                {kixikila.status === 'active' ? 'Ativa' : kixikila.status === 'paused' ? 'Pausada' : 'Concluída'}
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <KixikilaStats kixikila={kixikila} members={members} contributions={contributions} />

      {/* Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4 space-y-4">
          {currentRecipient && (
            <Card className="border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recebedor desta Rodada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{currentRecipient.name}</p>
                      <p className="text-sm text-muted-foreground">{currentRecipient.phone}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(kixikila.contribution_amount * (kixikila.total_members - 1), kixikila.currency)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Membros</h4>
              <p className="text-sm text-muted-foreground">
                {paidMemberIds.size} de {members.length} pagaram
              </p>
            </div>
            <Progress value={(paidMemberIds.size / members.length) * 100} className="mb-4" />
            <div className="space-y-2">
              {members.map((member) => {
                const hasPaid = paidMemberIds.has(member.id);
                const isRecipient = member.order_number === kixikila.current_round;
                return (
                  <div 
                    key={member.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${isRecipient ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-5 w-5"
                          onClick={() => handleMoveMember(member.id, 'up')}
                          disabled={member.order_number === 1 || kixikila.current_round > 1}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-5 w-5"
                          onClick={() => handleMoveMember(member.id, 'down')}
                          disabled={member.order_number === members.length || kixikila.current_round > 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      {hasPaid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">
                          {member.name}
                          {member.is_creator && <Badge variant="outline" className="ml-2">Criador</Badge>}
                          {isRecipient && <Badge className="ml-2">Recebe</Badge>}
                        </p>
                        <p className="text-sm text-muted-foreground">Ordem: {member.order_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.phone && !isRecipient && !hasPaid && (
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleWhatsAppReminder(member)}
                          title="Enviar lembrete via WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {!hasPaid && !isRecipient && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkPaid(member.id)}
                          disabled={addContribution.isPending}
                        >
                          Marcar Pago
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {allPaid && kixikila.current_round < kixikila.total_members && (
            <Button onClick={handleAdvanceRound} className="w-full" disabled={updateRound.isPending}>
              <Play className="mr-2 h-4 w-4" />
              Avançar para Rodada {kixikila.current_round + 1}
            </Button>
          )}
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <KixikilaProgressChart kixikila={kixikila} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <KixikilaCalendar kixikila={kixikila} members={members} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <KixikilaHistory kixikila={kixikila} members={members} contributions={contributions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Kixikilas() {
  const { data: kixikilas = [], isLoading } = useKixikilas();
  const createKixikila = useCreateKixikila();
  const deleteKixikila = useDeleteKixikila();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedKixikila, setSelectedKixikila] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contribution_amount: '',
    currency: 'AOA',
    frequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    members: [{ name: '', phone: '', is_creator: true }],
  });

  const addMember = () => {
    setFormData(p => ({
      ...p,
      members: [...p.members, { name: '', phone: '', is_creator: false }],
    }));
  };

  const updateMember = (index: number, field: string, value: string) => {
    setFormData(p => ({
      ...p,
      members: p.members.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  };

  const removeMember = (index: number) => {
    if (formData.members.length > 1) {
      setFormData(p => ({
        ...p,
        members: p.members.filter((_, i) => i !== index),
      }));
    }
  };

  const handleCreate = async () => {
    await createKixikila.mutateAsync({
      kixikila: {
        name: formData.name,
        description: formData.description || null,
        contribution_amount: parseFloat(formData.contribution_amount),
        currency: formData.currency,
        frequency: formData.frequency,
        start_date: formData.start_date,
        total_members: formData.members.length,
      },
      members: formData.members.map((m, i) => ({
        name: m.name,
        phone: m.phone || undefined,
        order_number: i + 1,
        is_creator: m.is_creator,
      })),
    });
    setCreateOpen(false);
    setFormData({
      name: '',
      description: '',
      contribution_amount: '',
      currency: 'AOA',
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      members: [{ name: '', phone: '', is_creator: true }],
    });
  };

  const activeKixikilas = kixikilas.filter(k => k.status === 'active');
  const pausedKixikilas = kixikilas.filter(k => k.status === 'paused');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Kixikila</h1>
          <p className="text-muted-foreground">Gestão de poupanças comunitárias rotativas</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Kixikila
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Kixikila</DialogTitle>
              <DialogDescription>Configure a poupança comunitária e adicione os membros.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nome da Kixikila</Label>
                  <Input 
                    placeholder="Ex: Kixikila da Família"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Descrição (opcional)</Label>
                  <Input 
                    placeholder="Descrição da poupança"
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor da Contribuição</Label>
                  <Input 
                    type="number"
                    placeholder="50000"
                    value={formData.contribution_amount}
                    onChange={(e) => setFormData(p => ({ ...p, contribution_amount: e.target.value }))}
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
                  <Label>Frequência</Label>
                  <Select value={formData.frequency} onValueChange={(v: 'weekly' | 'biweekly' | 'monthly') => setFormData(p => ({ ...p, frequency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input 
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Membros (ordem de recebimento)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addMember}>
                    <Plus className="mr-1 h-3 w-3" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.members.map((member, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-sm font-medium w-6">{index + 1}.</span>
                      <Input 
                        placeholder="Nome"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input 
                        placeholder="Telefone (com código país)"
                        value={member.phone}
                        onChange={(e) => updateMember(index, 'phone', e.target.value)}
                        className="w-40"
                      />
                      {formData.members.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeMember(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Adicione o código do país no telefone (ex: 244923456789) para receber lembretes via WhatsApp.
                </p>
              </div>

              <Button 
                onClick={handleCreate} 
                disabled={!formData.name || !formData.contribution_amount || formData.members.some(m => !m.name) || createKixikila.isPending}
                className="w-full"
              >
                {createKixikila.isPending ? 'A criar...' : 'Criar Kixikila'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Kixikilas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kixikilas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">{activeKixikilas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pausadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">{pausedKixikilas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(
                activeKixikilas.reduce((sum, k) => sum + k.contribution_amount, 0),
                'AOA'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kixikilas List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : kixikilas.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Nenhuma Kixikila</h3>
          <p className="text-muted-foreground mb-4">Crie a sua primeira poupança comunitária.</p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Kixikila
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kixikilas.map((kixikila) => (
            <Card 
              key={kixikila.id} 
              className={`cursor-pointer hover:border-primary transition-colors ${kixikila.status === 'paused' ? 'opacity-75' : ''}`}
              onClick={() => setSelectedKixikila(kixikila.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{kixikila.name}</CardTitle>
                    <CardDescription>{kixikila.description}</CardDescription>
                  </div>
                  <Badge variant={kixikila.status === 'active' ? 'default' : kixikila.status === 'paused' ? 'secondary' : 'outline'}>
                    {kixikila.status === 'active' ? 'Ativa' : kixikila.status === 'paused' ? 'Pausada' : 'Concluída'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Contribuição</span>
                    <span className="font-medium">{formatCurrency(kixikila.contribution_amount, kixikila.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Membros</span>
                    <span className="font-medium">{kixikila.total_members}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rodada</span>
                    <span className="font-medium">{kixikila.current_round} / {kixikila.total_members}</span>
                  </div>
                  <Progress value={(kixikila.current_round / kixikila.total_members) * 100} />
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{FREQUENCIES.find(f => f.value === kixikila.frequency)?.label}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteId(kixikila.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={!!selectedKixikila} onOpenChange={() => setSelectedKixikila(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedKixikila && (
            <KixikilaDetails kixikilaId={selectedKixikila} onClose={() => setSelectedKixikila(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Kixikila?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida. Todos os dados serão eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteKixikila.mutate(deleteId!); setDeleteId(null); }}
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
