import { Landmark, Smartphone, Wallet, Circle, MoreVertical, Power, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, ACCOUNT_TYPES } from '@/lib/constants';
import { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type Account = Database['public']['Tables']['accounts']['Row'];

const iconMap = {
  landmark: Landmark,
  smartphone: Smartphone,
  wallet: Wallet,
  circle: Circle,
};

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export function AccountCard({ account, onEdit, onToggleStatus }: AccountCardProps) {
  const accountType = ACCOUNT_TYPES.find(t => t.value === account.account_type);
  const IconComponent = iconMap[accountType?.icon as keyof typeof iconMap] || Circle;

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      !account.is_active && 'opacity-60'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2.5 rounded-xl',
              account.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{account.name}</h3>
              <p className="text-sm text-muted-foreground">
                {accountType?.label}
                {account.institution_name && ` • ${account.institution_name}`}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(account)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(account.id, !account.is_active)}>
                <Power className="h-4 w-4 mr-2" />
                {account.is_active ? 'Desactivar' : 'Activar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Saldo Actual</p>
            <p className={cn(
              'text-xl font-bold',
              Number(account.current_balance) >= 0 ? 'text-income' : 'text-expense'
            )}>
              {formatCurrency(Number(account.current_balance), account.currency)}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {account.currency}
            </Badge>
            {!account.is_active && (
              <Badge variant="secondary" className="text-xs">
                Inactiva
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
