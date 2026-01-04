import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, TrendingUp, Target, Wallet, CheckCircle2 } from 'lucide-react';
import { MaturityLevel, getLevelDisplayName } from '@/hooks/useMaturityProfile';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  requiredLevel: MaturityLevel;
  currentLevel: MaturityLevel;
}

const LEVEL_TIPS: Record<MaturityLevel, { tips: string[]; actions: { label: string; route: string }[] }> = {
  basic: {
    tips: [],
    actions: [],
  },
  intermediate: {
    tips: [
      'Crie um orçamento mensal para as suas categorias',
      'Adicione pelo menos 10 transações',
      'Defina uma meta de poupança',
    ],
    actions: [
      { label: 'Criar Orçamento', route: '/budgets' },
      { label: 'Definir Meta', route: '/goals' },
    ],
  },
  advanced: {
    tips: [
      'Comece a registar os seus investimentos',
      'Mantenha o orçamento atualizado por 2 meses',
      'Adicione as suas dívidas para controlo',
      'Atinja pelo menos 50% de uma meta',
    ],
    actions: [
      { label: 'Adicionar Investimento', route: '/investments' },
      { label: 'Gerir Dívidas', route: '/debts' },
    ],
  },
};

const LEVEL_HIERARCHY: Record<MaturityLevel, number> = {
  basic: 0,
  intermediate: 1,
  advanced: 2,
};

export function UpgradeDialog({ 
  open, 
  onOpenChange, 
  featureName, 
  requiredLevel, 
  currentLevel 
}: UpgradeDialogProps) {
  const navigate = useNavigate();
  
  // Get the next level the user needs to reach
  const getNextLevel = (): MaturityLevel => {
    if (currentLevel === 'basic') return 'intermediate';
    return 'advanced';
  };
  
  const nextLevel = getNextLevel();
  const levelInfo = LEVEL_TIPS[nextLevel];
  
  const handleActionClick = (route: string) => {
    onOpenChange(false);
    navigate(route);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-accent" />
          </div>
          <DialogTitle className="text-xl">
            {featureName}
          </DialogTitle>
          <DialogDescription className="text-base">
            Esta funcionalidade está disponível no nível{' '}
            <span className="font-semibold text-foreground">
              {getLevelDisplayName(requiredLevel)}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Current Level Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
              {['basic', 'intermediate', 'advanced'].map((lvl, index) => (
                <div key={lvl} className="flex items-center">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    LEVEL_HIERARCHY[currentLevel as MaturityLevel] >= index 
                      ? "bg-accent text-accent-foreground" 
                      : LEVEL_HIERARCHY[requiredLevel] === index
                        ? "bg-accent/20 text-accent border-2 border-accent border-dashed"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {LEVEL_HIERARCHY[currentLevel as MaturityLevel] >= index ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 2 && (
                    <div className={cn(
                      "h-0.5 w-6",
                      LEVEL_HIERARCHY[currentLevel as MaturityLevel] > index 
                        ? "bg-accent" 
                        : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Você está no nível <span className="font-medium text-foreground">{getLevelDisplayName(currentLevel)}</span>
          </div>
          
          {/* Tips to Level Up */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrendingUp className="h-4 w-4 text-accent" />
              Como avançar para {getLevelDisplayName(nextLevel)}:
            </div>
            <ul className="space-y-2">
              {levelInfo.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-accent">{index + 1}</span>
                  </div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Actions */}
          {levelInfo.actions.length > 0 && (
            <div className="flex gap-2">
              {levelInfo.actions.map((action) => (
                <Button
                  key={action.route}
                  variant="outline"
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => handleActionClick(action.route)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          className="w-full h-12 rounded-xl"
          onClick={() => onOpenChange(false)}
        >
          Entendido
        </Button>
      </DialogContent>
    </Dialog>
  );
}
