import { useState } from 'react';
import { 
  ArrowRightLeft, 
  Bell, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useLatestRates, 
  useExchangeRateAlerts, 
  useCreateExchangeRateAlert, 
  useDeleteExchangeRateAlert,
  useAddExchangeRate,
  convertCurrency 
} from '@/hooks/useExchangeRates';
import { formatCurrency, CURRENCIES } from '@/lib/constants';

export default function ExchangeRates() {
  const { data: rates = [], isLoading: ratesLoading } = useLatestRates();
  const { data: alerts = [], isLoading: alertsLoading } = useExchangeRateAlerts();
  const createAlert = useCreateExchangeRateAlert();
  const deleteAlert = useDeleteExchangeRateAlert();
  const addRate = useAddExchangeRate();

  const [converterFrom, setConverterFrom] = useState('USD');
  const [converterTo, setConverterTo] = useState('AOA');
  const [converterAmount, setConverterAmount] = useState('100');
  
  const [alertOpen, setAlertOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    base_currency: 'USD',
    target_currency: 'AOA',
    threshold_rate: '',
    alert_direction: 'above' as 'above' | 'below',
  });

  const [rateOpen, setRateOpen] = useState(false);
  const [newRate, setNewRate] = useState({
    base_currency: 'USD',
    target_currency: 'AOA',
    rate: '',
  });

  const convertedAmount = convertCurrency(
    parseFloat(converterAmount) || 0,
    converterFrom,
    converterTo,
    rates
  );

  const handleCreateAlert = async () => {
    await createAlert.mutateAsync({
      base_currency: newAlert.base_currency,
      target_currency: newAlert.target_currency,
      threshold_rate: parseFloat(newAlert.threshold_rate),
      alert_direction: newAlert.alert_direction,
      is_active: true,
    });
    setAlertOpen(false);
    setNewAlert({ base_currency: 'USD', target_currency: 'AOA', threshold_rate: '', alert_direction: 'above' });
  };

  const handleAddRate = async () => {
    await addRate.mutateAsync({
      base_currency: newRate.base_currency,
      target_currency: newRate.target_currency,
      rate: parseFloat(newRate.rate),
      source: 'manual',
    });
    setRateOpen(false);
    setNewRate({ base_currency: 'USD', target_currency: 'AOA', rate: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Taxas de Câmbio</h1>
          <p className="text-muted-foreground">Converter moedas e configurar alertas de variação</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={rateOpen} onOpenChange={setRateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Taxa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Taxa de Câmbio</DialogTitle>
                <DialogDescription>Adicione uma taxa de câmbio manualmente.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Moeda Base</Label>
                    <Select value={newRate.base_currency} onValueChange={(v) => setNewRate(p => ({ ...p, base_currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Moeda Destino</Label>
                    <Select value={newRate.target_currency} onValueChange={(v) => setNewRate(p => ({ ...p, target_currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Taxa</Label>
                  <Input 
                    type="number" 
                    placeholder="850.00"
                    value={newRate.rate}
                    onChange={(e) => setNewRate(p => ({ ...p, rate: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddRate} disabled={!newRate.rate || addRate.isPending} className="w-full">
                  {addRate.isPending ? 'A adicionar...' : 'Adicionar Taxa'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
            <DialogTrigger asChild>
              <Button>
                <Bell className="mr-2 h-4 w-4" />
                Criar Alerta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Alerta de Câmbio</DialogTitle>
                <DialogDescription>Receba uma notificação quando a taxa atingir o valor definido.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Moeda Base</Label>
                    <Select value={newAlert.base_currency} onValueChange={(v) => setNewAlert(p => ({ ...p, base_currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Moeda Destino</Label>
                    <Select value={newAlert.target_currency} onValueChange={(v) => setNewAlert(p => ({ ...p, target_currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Alertar quando a taxa estiver</Label>
                  <Select value={newAlert.alert_direction} onValueChange={(v: 'above' | 'below') => setNewAlert(p => ({ ...p, alert_direction: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Acima de</SelectItem>
                      <SelectItem value="below">Abaixo de</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor da Taxa</Label>
                  <Input 
                    type="number" 
                    placeholder="900.00"
                    value={newAlert.threshold_rate}
                    onChange={(e) => setNewAlert(p => ({ ...p, threshold_rate: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreateAlert} disabled={!newAlert.threshold_rate || createAlert.isPending} className="w-full">
                  {createAlert.isPending ? 'A criar...' : 'Criar Alerta'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Currency Converter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Conversor de Moedas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 space-y-2 w-full">
              <Label>Valor</Label>
              <Input 
                type="number"
                value={converterAmount}
                onChange={(e) => setConverterAmount(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="flex-1 space-y-2 w-full">
              <Label>De</Label>
              <Select value={converterFrom} onValueChange={setConverterFrom}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <RefreshCw className="h-5 w-5 text-muted-foreground mt-6" />
            <div className="flex-1 space-y-2 w-full">
              <Label>Para</Label>
              <Select value={converterTo} onValueChange={setConverterTo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2 w-full">
              <Label>Resultado</Label>
              <div className="h-10 flex items-center px-3 rounded-md border bg-muted">
                {convertedAmount !== null 
                  ? formatCurrency(convertedAmount, converterTo)
                  : 'Taxa não disponível'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Taxas Atuais</CardTitle>
          <CardDescription>Últimas taxas de câmbio registadas</CardDescription>
        </CardHeader>
        <CardContent>
          {ratesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : rates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma taxa registada. Adicione taxas manualmente.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rates.map((rate) => (
                <div key={rate.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{rate.base_currency} → {rate.target_currency}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(rate.fetched_at).toLocaleDateString('pt-AO')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{rate.rate.toFixed(2)}</p>
                    <Badge variant="outline">{rate.source}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas Ativos
          </CardTitle>
          <CardDescription>Alertas de variação de câmbio configurados</CardDescription>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum alerta configurado. Crie um alerta para ser notificado.
            </p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {alert.alert_direction === 'above' ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {alert.base_currency}/{alert.target_currency} {alert.alert_direction === 'above' ? '>' : '<'} {alert.threshold_rate}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Alertar quando {alert.alert_direction === 'above' ? 'acima' : 'abaixo'} de {alert.threshold_rate}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAlert.mutate(alert.id)}
                    disabled={deleteAlert.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
