import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, Edit2, PlusCircle, Target, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/constants';
import { differenceInDays, isPast } from 'date-fns';

interface Goal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  currency?: string;
  status: string;
}

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onContribute: () => void;
}

function getStatusConfig(status: string, progress: number, targetDate: string | null) {
  const isOverdue = targetDate && isPast(new Date(targetDate)) && status === 'in_progress';
  
  if (status === 'completed') {
    return { label: 'Concluída', variant: 'default' as const, icon: CheckCircle2 };
  }
  if (status === 'cancelled') {
    return { label: 'Cancelada', variant: 'secondary' as const, icon: XCircle };
  }
  if (isOverdue) {
    return { label: 'Atrasada', variant: 'destructive' as const, icon: Calendar };
  }
  if (progress >= 75) {
    return { label: 'Quase lá', variant: 'default' as const, icon: Target };
  }
  return { label: 'Em Progresso', variant: 'outline' as const, icon: Target };
}

export function GoalCard({ goal, onEdit, onDelete, onContribute }: GoalCardProps) {
  const current = Number(goal.current_amount);
  const target = Number(goal.target_amount);
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const remaining = Math.max(target - current, 0);
  
  const statusConfig = getStatusConfig(goal.status, progress, goal.deadline);
  const StatusIcon = statusConfig.icon;
  
  const daysRemaining = goal.deadline
    ? differenceInDays(new Date(goal.deadline), new Date())
    : null;

  const isActive = goal.status === 'in_progress';

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">{goal.name}</CardTitle>
              <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-primary">
              {formatCurrency(current, goal.currency)}
            </span>
            <span className="text-muted-foreground">
              de {formatCurrency(target, goal.currency)}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Falta</p>
            <p className="font-semibold text-foreground">
              {formatCurrency(remaining, goal.currency)}
            </p>
          </div>
          {goal.deadline && (
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Data Alvo</p>
              <p className="font-semibold text-foreground">
                {formatDate(goal.deadline)}
              </p>
              {daysRemaining !== null && isActive && (
                <p className={`text-xs ${daysRemaining < 0 ? 'text-destructive' : daysRemaining < 30 ? 'text-warning' : 'text-muted-foreground'}`}>
                  {daysRemaining < 0
                    ? `${Math.abs(daysRemaining)} dias atrasado`
                    : daysRemaining === 0
                    ? 'Hoje'
                    : `${daysRemaining} dias restantes`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Contribute Button */}
        {isActive && remaining > 0 && (
          <Button onClick={onContribute} className="w-full" variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Contribuição
          </Button>
        )}

        {progress >= 100 && goal.status === 'in_progress' && (
          <div className="text-center p-3 bg-income/10 rounded-lg border border-income/20">
            <p className="text-sm font-medium text-income">
              🎉 Meta atingida! Actualize o estado para "Concluída".
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
