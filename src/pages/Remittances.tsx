import { useState } from 'react';
import { 
  Send, 
  Plus, 
  Plane,
  Trash2,
  TrendingUp,
  DollarSign,
  MapPin,
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  useRemittances, 
  useRemittanceStats,
  useCreateRemittance, 
  useDeleteRemittance,
  REMITTANCE_PROVIDERS,
  COMMON_COUNTRIES,
} from '@/hooks/useRemittances';
import { formatCurrency, formatDate, CURRENCIES } from '@/lib/constants';

export default function Remittances() {
  const { data: remittances = [], isLoading } = useRemittances();
  const stats = useRemittanceStats();
  const createRemittance = useCreateRemittance();
  const deleteRemittance = useDeleteRemittance();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_country: 'PT',
    recipient_name: '',
    recipient_phone: '',
    amount_sent: '',
    currency_from: 'EUR',
    amount_received: '',
    currency_to: 'AOA',
    exchange_rate: '',
    service_provider: 'Western Union',
    fee: '',
    transfer_date: new Date().toISOString().split('T')[0],
    status: 'completed' as const,
    notes: '',
  });

  // Auto-calculate amount received when amount sent and rate change
  const handleAmountChange = (field: 'amount_sent' | 'exchange_rate', value: string) => {
    const newData = { ...formData, [field]: value };
    const sent = parseFloat(field === 'amount_sent' ? value : formData.amount_sent) || 0;
    const rate = parseFloat(field === 'exchange_rate' ? value : formData.exchange_rate) || 0;
    if (sent && rate) {
      newData.amount_received = (sent * rate).toFixed(2);
    }
    setFormData(newData);
  };

  const handleCreate = async () => {
    await createRemittance.mutateAsync({
      sender_name: formData.sender_name,
      sender_country: formData.sender_country,
      recipient_name: formData.recipient_name,
      recipient_phone: formData.recipient_phone || null,
      amount_sent: parseFloat(formData.amount_sent),
      currency_from: formData.currency_from,
      amount_received: parseFloat(formData.amount_received),
      currency_to: formData.currency_to,
      exchange_rate: parseFloat(formData.exchange_rate),
      service_provider: formData.service_provider,
      fee: parseFloat(formData.fee) || 0,
      transfer_date: formData.transfer_date,
      status: formData.status,
      notes: formData.notes || null,
    });
    setCreateOpen(false);
    setFormData({
      sender_name: '',
      sender_country: 'PT',
      recipient_name: '',
      recipient_phone: '',
      amount_sent: '',
      currency_from: 'EUR',
      amount_received: '',
      currency_to: 'AOA',
      exchange_rate: '',
      service_provider: 'Western Union',
      fee: '',
      transfer_date: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Remessas</h1>
          <p className="text-muted-foreground">Rastrear transferências internacionais e custos de envio</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Remessa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registar Nova Remessa</DialogTitle>
              <DialogDescription>Registe uma transferência internacional recebida.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Remetente</Label>
                  <Input 
                    placeholder="Nome de quem enviou"
                    value={formData.sender_name}
                    onChange={(e) => setFormData(p => ({ ...p, sender_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>País de Origem</Label>
                  <Select value={formData.sender_country} onValueChange={(v) => setFormData(p => ({ ...p, sender_country: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COMMON_COUNTRIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nome do Destinatário</Label>
                  <Input 
                    placeholder="Nome de quem recebeu"
                    value={formData.recipient_name}
                    onChange={(e) => setFormData(p => ({ ...p, recipient_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone do Destinatário</Label>
                  <Input 
                    placeholder="+244 9XX XXX XXX"
                    value={formData.recipient_phone}
                    onChange={(e) => setFormData(p => ({ ...p, recipient_phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Valor Enviado</Label>
                  <Input 
                    type="number"
                    placeholder="500"
                    value={formData.amount_sent}
                    onChange={(e) => handleAmountChange('amount_sent', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moeda Origem</Label>
                  <Select value={formData.currency_from} onValueChange={(v) => setFormData(p => ({ ...p, currency_from: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Taxa de Câmbio</Label>
                  <Input 
                    type="number"
                    placeholder="850"
                    value={formData.exchange_rate}
                    onChange={(e) => handleAmountChange('exchange_rate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Valor Recebido</Label>
                  <Input 
                    type="number"
                    placeholder="425000"
                    value={formData.amount_received}
                    onChange={(e) => setFormData(p => ({ ...p, amount_received: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moeda Destino</Label>
                  <Select value={formData.currency_to} onValueChange={(v) => setFormData(p => ({ ...p, currency_to: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Taxa de Serviço</Label>
                  <Input 
                    type="number"
                    placeholder="15"
                    value={formData.fee}
                    onChange={(e) => setFormData(p => ({ ...p, fee: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Serviço Utilizado</Label>
                  <Select value={formData.service_provider} onValueChange={(v) => setFormData(p => ({ ...p, service_provider: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REMITTANCE_PROVIDERS.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data da Transferência</Label>
                  <Input 
                    type="date"
                    value={formData.transfer_date}
                    onChange={(e) => setFormData(p => ({ ...p, transfer_date: e.target.value }))}
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
                onClick={handleCreate} 
                disabled={!formData.sender_name || !formData.recipient_name || !formData.amount_sent || !formData.exchange_rate || createRemittance.isPending}
                className="w-full"
              >
                {createRemittance.isPending ? 'A registar...' : 'Registar Remessa'}
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
              Total Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalReceived, 'AOA')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total em Taxas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-500">{formatCurrency(stats.totalFees, 'EUR')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Send className="h-4 w-4" />
              Transferências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Serviços Usados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Object.keys(stats.byProvider).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Remittances List */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Remessas</CardTitle>
          <CardDescription>Todas as transferências internacionais registadas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : remittances.length === 0 ? (
            <div className="text-center py-8">
              <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhuma Remessa</h3>
              <p className="text-muted-foreground mb-4">Registe a sua primeira remessa internacional.</p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Registar Remessa
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {remittances.map((remittance) => (
                <div 
                  key={remittance.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Send className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{remittance.sender_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{COMMON_COUNTRIES.find(c => c.code === remittance.sender_country)?.name}</span>
                        <span>→</span>
                        <span>{remittance.recipient_name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{remittance.service_provider}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(remittance.transfer_date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(remittance.amount_sent, remittance.currency_from)}
                      </p>
                      <p className="text-lg font-bold text-green-500">
                        {formatCurrency(remittance.amount_received, remittance.currency_to)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Taxa: {remittance.exchange_rate} | Fee: {formatCurrency(remittance.fee, remittance.currency_from)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(remittance.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Remessa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteRemittance.mutate(deleteId!); setDeleteId(null); }}
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
