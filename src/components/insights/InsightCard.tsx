import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  PiggyBank, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Landmark, 
  Check,
  Trash2,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface InsightCardProps {
  insight: {
    id: string;
    insight_type: string;
    title: string;
    message: string;
    is_read: boolean;
    generated_at: string;
  };
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const insightConfig: Record<string, { icon: typeof Lightbulb; color: string; bgColor: string }> = {
  savings_opportunity: { 
    icon: PiggyBank, 
    color: 'text-income', 
    bgColor: 'bg-income/10' 
  },
  budget_alert: { 
    icon: AlertTriangle, 
    color: 'text-warning', 
    bgColor: 'bg-warning/10' 
  },
  high_expense: { 
    icon: TrendingUp, 
    color: 'text-expense', 
    bgColor: 'bg-expense/10' 
  },
  goal_reminder: { 
    icon: Target, 
    color: 'text-primary', 
    bgColor: 'bg-primary/10' 
  },
  investment_tip: { 
    icon: Landmark, 
    color: 'text-accent-teal', 
    bgColor: 'bg-accent-teal/10' 
  },
  general: { 
    icon: Lightbulb, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted' 
  },
};

const insightTypeLabels: Record<string, string> = {
  savings_opportunity: 'Poupança',
  budget_alert: 'Orçamento',
  high_expense: 'Despesas',
  goal_reminder: 'Metas',
  investment_tip: 'Investimentos',
  general: 'Geral',
};

export function InsightCard({ insight, onMarkAsRead, onDelete }: InsightCardProps) {
  const config = insightConfig[insight.insight_type] || insightConfig.general;
  const Icon = config.icon;

  const timeAgo = formatDistanceToNow(new Date(insight.generated_at), {
    addSuffix: true,
    locale: pt,
  });

  return (
    <Card className={`group transition-all ${!insight.is_read ? 'border-primary/50 shadow-md' : ''}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className={`flex-shrink-0 p-3 rounded-xl ${config.bgColor}`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{insight.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {insightTypeLabels[insight.insight_type] || 'Geral'}
                </Badge>
                {!insight.is_read && (
                  <Badge className="text-xs bg-primary">Novo</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!insight.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onMarkAsRead}
                    title="Marcar como lido"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={onDelete}
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {insight.message}
            </p>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
