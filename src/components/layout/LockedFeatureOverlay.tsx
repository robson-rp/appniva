import { Lock } from 'lucide-react';
import { MaturityLevel, getLevelDisplayName } from '@/hooks/useMaturityProfile';
import { cn } from '@/lib/utils';

interface LockedFeatureOverlayProps {
  requiredLevel: MaturityLevel;
  currentLevel: MaturityLevel;
  className?: string;
}

export function LockedFeatureOverlay({ 
  requiredLevel, 
  currentLevel, 
  className 
}: LockedFeatureOverlayProps) {
  const levelProgress = {
    'basic': 0,
    'intermediate': 1,
    'advanced': 2,
  };
  
  const stepsToUnlock = levelProgress[requiredLevel] - levelProgress[currentLevel];
  
  return (
    <div className={cn(
      "absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl",
      className
    )}>
      <div className="flex flex-col items-center gap-3 p-4 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">
            Disponível no nível {getLevelDisplayName(requiredLevel)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stepsToUnlock === 1 
              ? 'Falta 1 nível para desbloquear'
              : `Faltam ${stepsToUnlock} níveis para desbloquear`
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// Tooltip version for navigation items
export function LockedFeatureTooltip({ requiredLevel }: { requiredLevel: MaturityLevel }) {
  return (
    <span className="text-xs text-muted-foreground">
      Disponível no nível {getLevelDisplayName(requiredLevel)}
    </span>
  );
}

// Badge version for feature cards
export function LockedFeatureBadge({ requiredLevel }: { requiredLevel: MaturityLevel }) {
  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-muted/90 backdrop-blur-sm">
      <Lock className="h-3 w-3 text-muted-foreground" />
      <span className="text-[10px] font-medium text-muted-foreground">
        {getLevelDisplayName(requiredLevel)}
      </span>
    </div>
  );
}
