import { Link } from 'react-router-dom';
import { useDailyRecommendation } from '@/hooks/useDailyRecommendation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Lightbulb,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function TodayCard() {
  const { t } = useTranslation();
  const { recommendation, isLoading } = useDailyRecommendation();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-4 border border-accent/20">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-9 w-28" />
      </div>
    );
  }

  if (!recommendation) {
    return null;
  }

  const priorityConfig = {
    high: {
      icon: AlertTriangle,
      gradient: 'from-expense/20 to-expense/5',
      border: 'border-expense/30',
      iconColor: 'text-expense',
      labelColor: 'text-expense',
      label: 'Urgente',
    },
    medium: {
      icon: TrendingUp,
      gradient: 'from-warning/20 to-warning/5',
      border: 'border-warning/30',
      iconColor: 'text-warning',
      labelColor: 'text-warning',
      label: 'Importante',
    },
    low: {
      icon: Lightbulb,
      gradient: 'from-accent/20 to-accent/5',
      border: 'border-accent/20',
      iconColor: 'text-accent',
      labelColor: 'text-accent',
      label: 'Dica',
    },
  };

  const config = priorityConfig[recommendation.priority];
  const Icon = config.icon;

  return (
    <div className={cn(
      "bg-gradient-to-br rounded-2xl p-4 border transition-all duration-300",
      config.gradient,
      config.border
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          "flex items-center justify-center h-6 w-6 rounded-full",
          recommendation.priority === 'high' && "bg-expense/20",
          recommendation.priority === 'medium' && "bg-warning/20",
          recommendation.priority === 'low' && "bg-accent/20"
        )}>
          <Icon className={cn("h-3.5 w-3.5", config.iconColor)} />
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold uppercase tracking-wide", config.labelColor)}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Hoje
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-1">
        {recommendation.title}
      </h3>

      {/* Message */}
      <p className="text-sm text-muted-foreground mb-3">
        {recommendation.message}
      </p>

      {/* Action */}
      <Link to={recommendation.action_route}>
        <Button 
          size="sm" 
          className={cn(
            "gap-1.5",
            recommendation.priority === 'high' && "bg-expense hover:bg-expense/90",
            recommendation.priority === 'medium' && "bg-warning hover:bg-warning/90 text-warning-foreground",
            recommendation.priority === 'low' && "bg-accent hover:bg-accent/90"
          )}
        >
          {recommendation.action_label}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
