import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
// removed supabase import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  Target,
  Landmark,
  ArrowRight, 
  CheckCircle,
  Sparkles,
  Shield
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { SecurityBadgesRow } from '@/components/security/SecurityBadgesRow';
import { NivaLogo } from '@/components/brand/NivaLogo';
import { 
  useMaturityProfile, 
  OnboardingAnswers, 
  PrimaryGoal,
  calculateMaturityLevel,
  getLevelDisplayName
} from '@/hooks/useMaturityProfile';

const STEPS = [
  { id: 1, title: 'Perfil', icon: Wallet },
  { id: 2, title: 'Objetivo', icon: Target },
  { id: 3, title: 'Pronto', icon: CheckCircle },
];

// Question options
const BOOLEAN_OPTIONS = [
  { value: true, label: 'Sim' },
  { value: false, label: 'Não' },
];

const PRIMARY_GOALS: { value: PrimaryGoal; label: string; icon: typeof Wallet; description: string }[] = [
  { 
    value: 'control_expenses', 
    label: 'Controlar despesas', 
    icon: Wallet,
    description: 'Saber para onde vai o meu dinheiro'
  },
  { 
    value: 'save', 
    label: 'Poupar', 
    icon: PiggyBank,
    description: 'Construir uma reserva financeira'
  },
  { 
    value: 'pay_debts', 
    label: 'Sair de dívidas', 
    icon: CreditCard,
    description: 'Livrar-me de empréstimos e dívidas'
  },
  { 
    value: 'invest_better', 
    label: 'Investir melhor', 
    icon: TrendingUp,
    description: 'Fazer o dinheiro trabalhar para mim'
  },
];

export function SmartOnboardingWizard() {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { createProfile } = useMaturityProfile();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [showLevelReveal, setShowLevelReveal] = useState(false);

  const handleBooleanAnswer = (key: keyof OnboardingAnswers, value: boolean) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleGoalSelect = (goal: PrimaryGoal) => {
    setAnswers(prev => ({ ...prev, primary_goal: goal }));
  };

  const isStep1Complete = 
    answers.has_fixed_income !== undefined &&
    answers.uses_budget !== undefined &&
    answers.has_debts !== undefined &&
    answers.has_investments !== undefined;

  const isStep2Complete = answers.primary_goal !== undefined;

  const handleNextStep = () => {
    if (step === 1 && isStep1Complete) {
      setStep(2);
    } else if (step === 2 && isStep2Complete) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!isStep1Complete || !isStep2Complete) return;
    
    setIsLoading(true);
    
    try {
      // Create maturity profile
      await createProfile.mutateAsync(answers as OnboardingAnswers);
      
      // Mark onboarding as completed
      await updateProfile({ onboarding_completed: true });
      await refreshProfile();
      
      // Show level reveal animation
      setShowLevelReveal(true);
      setStep(3);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Erro ao completar onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    navigate('/home');
  };

  const calculatedLevel = calculateMaturityLevel(answers);
  const progressPercent = (step / 3) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progressPercent} className="h-2" />
          <div className="mt-4 flex justify-between">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={cn(
                  'flex flex-col items-center gap-2 transition-all duration-300',
                  step >= s.id ? 'text-accent' : 'text-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300',
                    step >= s.id ? 'bg-accent text-accent-foreground' : 'bg-muted'
                  )}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="animate-scale-in">
          {/* Step 1 - Financial Profile Questions */}
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <NivaLogo size="lg" />
                </div>
                <CardTitle className="text-2xl">
                  Olá, {profile?.name?.split(' ')[0]}!
                </CardTitle>
                <CardDescription>
                  Responde a algumas perguntas para personalizar a tua experiência.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question 1: Fixed Income */}
                <QuestionCard
                  question="Tens renda fixa mensal?"
                  icon={Landmark}
                  value={answers.has_fixed_income}
                  onChange={(v) => handleBooleanAnswer('has_fixed_income', v)}
                />

                {/* Question 2: Budget */}
                <QuestionCard
                  question="Usas orçamento mensal?"
                  icon={PiggyBank}
                  value={answers.uses_budget}
                  onChange={(v) => handleBooleanAnswer('uses_budget', v)}
                />

                {/* Question 3: Debts */}
                <QuestionCard
                  question="Tens dívidas ou empréstimos?"
                  icon={CreditCard}
                  value={answers.has_debts}
                  onChange={(v) => handleBooleanAnswer('has_debts', v)}
                />

                {/* Question 4: Investments */}
                <QuestionCard
                  question="Já investes dinheiro?"
                  icon={TrendingUp}
                  value={answers.has_investments}
                  onChange={(v) => handleBooleanAnswer('has_investments', v)}
                />

                <Button 
                  onClick={handleNextStep} 
                  className="w-full" 
                  disabled={!isStep1Complete}
                >
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 2 - Primary Goal */}
          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                  <Target className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Qual é o teu objetivo principal?</CardTitle>
                <CardDescription>
                  Escolhe uma prioridade para começar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {PRIMARY_GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => handleGoalSelect(goal.value)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left',
                      answers.primary_goal === goal.value
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50 bg-card'
                    )}
                  >
                    <div className={cn(
                      'h-12 w-12 rounded-lg flex items-center justify-center',
                      answers.primary_goal === goal.value
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      <goal.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{goal.label}</p>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    {answers.primary_goal === goal.value && (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    )}
                  </button>
                ))}

                <Button 
                  onClick={handleNextStep} 
                  className="w-full mt-4" 
                  disabled={!isStep2Complete || isLoading}
                >
                  {isLoading ? 'A processar...' : 'Concluir'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 3 - Completion with Level Reveal */}
          {step === 3 && (
            <>
              <CardHeader className="text-center">
                <div className={cn(
                  "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-700",
                  showLevelReveal ? "bg-income scale-100" : "bg-muted scale-50 opacity-0"
                )}>
                  <Sparkles className="h-8 w-8 text-income-foreground animate-pulse" />
                </div>
                <CardTitle className={cn(
                  "text-2xl transition-all duration-500 delay-200",
                  showLevelReveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}>
                  Tudo Pronto!
                </CardTitle>
                <CardDescription className={cn(
                  "transition-all duration-500 delay-300",
                  showLevelReveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}>
                  Vamos organizar as tuas finanças passo a passo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Level Badge */}
                <div className={cn(
                  "p-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 text-center transition-all duration-700 delay-400",
                  showLevelReveal ? "opacity-100 scale-100" : "opacity-0 scale-90"
                )}>
                  <p className="text-sm text-muted-foreground mb-2">O teu nível financeiro</p>
                  <p className="text-3xl font-bold text-accent mb-2">
                    {getLevelDisplayName(calculatedLevel)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {calculatedLevel === 'basic' && 'Começaremos pelo básico para construir hábitos sólidos.'}
                    {calculatedLevel === 'intermediate' && 'Já tens boas bases! Vamos otimizar as tuas finanças.'}
                    {calculatedLevel === 'advanced' && 'Estás pronto para estratégias avançadas!'}
                  </p>
                </div>

                {/* What's unlocked */}
                <div className={cn(
                  "text-center transition-all duration-500 delay-500",
                  showLevelReveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}>
                  <p className="text-sm text-muted-foreground mb-3">
                    Funcionalidades desbloqueadas:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Contas', 'Transações', 'Orçamentos', 'Metas'].map((feature, i) => (
                      <span 
                        key={feature}
                        className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium"
                        style={{ animationDelay: `${600 + i * 100}ms` }}
                      >
                        {feature}
                      </span>
                    ))}
                    {calculatedLevel !== 'basic' && (
                      <>
                        {['Dívidas', 'Subscrições', 'Insights'].map((feature, i) => (
                          <span 
                            key={feature}
                            className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </>
                    )}
                    {calculatedLevel === 'advanced' && (
                      <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                        + Tudo!
                      </span>
                    )}
                  </div>
                </div>

                {/* Security Message */}
                <div className={cn(
                  "p-4 rounded-xl bg-muted/50 border border-border text-center transition-all duration-500 delay-550",
                  showLevelReveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-foreground">
                      A tua informação financeira está protegida
                    </span>
                  </div>
                  <SecurityBadgesRow size="sm" />
                </div>

                <Button 
                  onClick={handleFinish} 
                  className={cn(
                    "w-full transition-all duration-500 delay-600",
                    showLevelReveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                >
                  Começar a usar
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

// Helper component for boolean questions
function QuestionCard({
  question,
  icon: Icon,
  value,
  onChange,
}: {
  question: string;
  icon: typeof Wallet;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">{question}</span>
      </div>
      <div className="flex gap-3">
        {BOOLEAN_OPTIONS.map((option) => (
          <button
            key={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all',
              value === option.value
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-card text-muted-foreground hover:border-accent/50'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
