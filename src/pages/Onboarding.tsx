import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Wallet, Globe, Banknote, ArrowRight, CheckCircle } from 'lucide-react';
import { CURRENCIES, ACCOUNT_TYPES, ANGOLA_BANKS, MOBILE_WALLETS } from '@/lib/constants';
import { Progress } from '@/components/ui/progress';

const steps = [
  { id: 1, title: 'Preferências', icon: Globe },
  { id: 2, title: 'Primeira Conta', icon: Banknote },
  { id: 3, title: 'Concluído', icon: CheckCircle },
];

type AccountType = 'bank' | 'wallet' | 'cash' | 'other';

export default function Onboarding() {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [preferences, setPreferences] = useState({
    primary_currency: 'AOA',
    monthly_income: '',
  });

  const [account, setAccount] = useState({
    name: '',
    account_type: 'bank' as AccountType,
    institution_name: '',
    currency: 'AOA',
    initial_balance: '',
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.onboarding_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  const handlePreferencesSubmit = async () => {
    setIsLoading(true);
    const { error } = await updateProfile({
      primary_currency: preferences.primary_currency,
      monthly_income: preferences.monthly_income ? parseFloat(preferences.monthly_income) : null,
    });
    setIsLoading(false);

    if (error) {
      toast.error('Erro ao guardar preferências');
      return;
    }
    setStep(2);
  };

  const handleAccountSubmit = async () => {
    if (!account.name) {
      toast.error('Por favor, introduza um nome para a conta');
      return;
    }

    setIsLoading(true);

    const { error: accountError } = await supabase.from('accounts').insert({
      user_id: user.id,
      name: account.name,
      account_type: account.account_type,
      institution_name: account.institution_name || null,
      currency: account.currency,
      initial_balance: account.initial_balance ? parseFloat(account.initial_balance) : 0,
      current_balance: account.initial_balance ? parseFloat(account.initial_balance) : 0,
    });

    if (accountError) {
      toast.error('Erro ao criar conta');
      setIsLoading(false);
      return;
    }

    const { error: profileError } = await updateProfile({ onboarding_completed: true });

    if (profileError) {
      toast.error('Erro ao finalizar configuração');
      setIsLoading(false);
      return;
    }

    await refreshProfile();
    setIsLoading(false);
    setStep(3);
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  const getInstitutions = () => {
    if (account.account_type === 'bank') return ANGOLA_BANKS;
    if (account.account_type === 'wallet') return MOBILE_WALLETS;
    return [];
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={(step / 3) * 100} className="h-2" />
          <div className="mt-4 flex justify-between">
            {steps.map((s) => (
              <div
                key={s.id}
                className={`flex flex-col items-center gap-2 ${
                  step >= s.id ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    step >= s.id ? 'bg-accent text-accent-foreground' : 'bg-muted'
                  }`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="animate-scale-in">
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <Globe className="h-7 w-7 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl">Bem-vindo, {profile?.name?.split(' ')[0]}!</CardTitle>
                <CardDescription>
                  Vamos configurar a sua experiência. Primeiro, escolha as suas preferências.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda Principal</Label>
                  <Select
                    value={preferences.primary_currency}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, primary_currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income">Rendimento Mensal Aproximado (opcional)</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="Ex: 250000"
                    value={preferences.monthly_income}
                    onChange={(e) =>
                      setPreferences({ ...preferences, monthly_income: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta informação ajuda a gerar insights personalizados
                  </p>
                </div>

                <Button onClick={handlePreferencesSubmit} className="w-full" disabled={isLoading}>
                  {isLoading ? 'A guardar...' : 'Continuar'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <Banknote className="h-7 w-7 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl">Criar a Primeira Conta</CardTitle>
                <CardDescription>
                  Adicione a sua primeira conta financeira para começar a gerir as suas finanças.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Nome da Conta</Label>
                  <Input
                    id="account-name"
                    placeholder="Ex: BFA Kz Principal"
                    value={account.name}
                    onChange={(e) => setAccount({ ...account, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Conta</Label>
                  <Select
                    value={account.account_type}
                    onValueChange={(value: AccountType) =>
                      setAccount({ ...account, account_type: value, institution_name: '' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(account.account_type === 'bank' || account.account_type === 'wallet') && (
                  <div className="space-y-2">
                    <Label>
                      {account.account_type === 'bank' ? 'Banco' : 'Operadora'}
                    </Label>
                    <Select
                      value={account.institution_name}
                      onValueChange={(value) =>
                        setAccount({ ...account, institution_name: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getInstitutions().map((inst) => (
                          <SelectItem key={inst} value={inst}>
                            {inst}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select
                    value={account.currency}
                    onValueChange={(value) => setAccount({ ...account, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balance">Saldo Inicial</Label>
                  <Input
                    id="balance"
                    type="number"
                    placeholder="0.00"
                    value={account.initial_balance}
                    onChange={(e) => setAccount({ ...account, initial_balance: e.target.value })}
                  />
                </div>

                <Button onClick={handleAccountSubmit} className="w-full" disabled={isLoading}>
                  {isLoading ? 'A criar...' : 'Criar Conta'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-income">
                  <CheckCircle className="h-7 w-7 text-income-foreground" />
                </div>
                <CardTitle className="text-2xl">Tudo Pronto!</CardTitle>
                <CardDescription>
                  A sua conta está configurada. Está pronto para começar a gerir as suas finanças de forma inteligente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleFinish} className="w-full">
                  Ir para o Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
