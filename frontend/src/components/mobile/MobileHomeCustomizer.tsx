import { Settings, Check, ChevronUp, ChevronDown, RotateCcw, X, Circle, Wallet, ArrowUpDown, PiggyBank, TrendingUp, Target, Calendar, RefreshCw, CreditCard, BarChart3, Lightbulb, MessageCircle, Calculator, Repeat, DollarSign, Users, Send, Receipt, ScanText, LucideIcon } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMobileHomePreferences, ALL_MOBILE_FEATURES } from '@/hooks/useMobileHomePreferences';
import { useTranslation } from 'react-i18next';

const ICON_MAP: Record<string, LucideIcon> = {
  Wallet, ArrowUpDown, PiggyBank, TrendingUp, Target, Calendar, RefreshCw, 
  CreditCard, BarChart3, Lightbulb, MessageCircle, Calculator, Repeat, 
  DollarSign, Users, Send, Receipt, ScanText, Circle
};

interface MobileHomeCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileHomeCustomizer({ open, onOpenChange }: MobileHomeCustomizerProps) {
  const { t } = useTranslation();
  const { 
    selectedFeatures, 
    toggleFeature, 
    moveFeature, 
    resetToDefault, 
    isSelected,
    maxFeatures,
    canAddMore
  } = useMobileHomePreferences();

  const getIcon = (iconName: string): LucideIcon => {
    return ICON_MAP[iconName] || Circle;
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="border-b border-border pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-semibold">Personalizar Menu</DrawerTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Selecione até {maxFeatures} funcionalidades ({selectedFeatures.length}/{maxFeatures})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={resetToDefault}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <DrawerClose asChild>
                <button className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Selected Features */}
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Funcionalidades Selecionadas
            </h3>
            <div className="space-y-2">
              {selectedFeatures.map((featureId, index) => {
                const feature = ALL_MOBILE_FEATURES.find(f => f.id === featureId);
                if (!feature) return null;
                const Icon = getIcon(feature.iconName);
                
                return (
                  <div 
                    key={featureId}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                  >
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', feature.color)}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="flex-1 text-sm font-medium">{t(feature.labelKey)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveFeature(featureId, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveFeature(featureId, 'down')}
                        disabled={index === selectedFeatures.length - 1}
                        className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleFeature(featureId)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {selectedFeatures.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma funcionalidade selecionada
                </p>
              )}
            </div>
          </div>

          {/* Available Features */}
          <div className="p-4 pb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Funcionalidades Disponíveis
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {ALL_MOBILE_FEATURES.filter(f => !isSelected(f.id)).map((feature) => {
                const Icon = getIcon(feature.iconName);
                
                return (
                  <button
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    disabled={!canAddMore}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                      canAddMore
                        ? "bg-muted/50 hover:bg-muted active:scale-95"
                        : "bg-muted/30 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', feature.color)}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight line-clamp-2">
                      {t(feature.labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>
            {!canAddMore && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Limite de {maxFeatures} funcionalidades atingido. Remova uma para adicionar outra.
              </p>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
