import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  MoreVertical, 
  Pencil, 
  Trash2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CostCenterWithStats } from '@/hooks/useCostCenters';
import { formatCurrency } from '@/lib/utils';

interface CostCenterCardProps {
  center: CostCenterWithStats;
  onEdit: (center: CostCenterWithStats) => void;
  onDelete: (id: string) => void;
}

export const CostCenterCard = ({ center, onEdit, onDelete }: CostCenterCardProps) => {
  const isIncomeCenter = center.type === 'income_center';
  const Icon = isIncomeCenter ? TrendingUp : TrendingDown;
  
  return (
    <Card className="relative overflow-hidden">
      <div 
        className={`absolute top-0 left-0 w-1 h-full ${
          isIncomeCenter ? 'bg-emerald-500' : 'bg-rose-500'
        }`} 
      />
      
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isIncomeCenter 
              ? 'bg-emerald-500/10 text-emerald-500' 
              : 'bg-rose-500/10 text-rose-500'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{center.name}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {isIncomeCenter ? 'Centro de Receita' : 'Centro de Despesa'}
            </Badge>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(center)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(center.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {center.description && (
          <p className="text-sm text-muted-foreground">{center.description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total do mês</span>
            <span className={`font-semibold ${
              isIncomeCenter ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              {formatCurrency(center.total_amount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Transações</span>
            <span className="font-medium">{center.transaction_count}</span>
          </div>
          
          {!isIncomeCenter && center.budget_percentage !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">% do orçamento</span>
                <span className="font-medium">
                  {center.budget_percentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(center.budget_percentage, 100)} 
                className="h-2"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
