import { Calendar, User, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Kixikila, KixikilaMember } from '@/hooks/useKixikilas';
import { formatCurrency } from '@/lib/constants';
import { addWeeks, format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface KixikilaCalendarProps {
  kixikila: Kixikila;
  members: KixikilaMember[];
}

export function KixikilaCalendar({ kixikila, members }: KixikilaCalendarProps) {
  const getPaymentDate = (roundNumber: number) => {
    const startDate = new Date(kixikila.start_date);
    const roundsOffset = roundNumber - 1;
    
    switch (kixikila.frequency) {
      case 'weekly':
        return addWeeks(startDate, roundsOffset);
      case 'biweekly':
        return addWeeks(startDate, roundsOffset * 2);
      case 'monthly':
      default:
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + roundsOffset);
        return date;
    }
  };

  const schedule = members
    .sort((a, b) => a.order_number - b.order_number)
    .map((member) => ({
      member,
      date: getPaymentDate(member.order_number),
      isCompleted: member.order_number < kixikila.current_round,
      isCurrent: member.order_number === kixikila.current_round,
      isPending: member.order_number > kixikila.current_round,
    }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Calendário de Pagamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {schedule.map((item, index) => (
              <div 
                key={item.member.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  item.isCurrent 
                    ? 'border-primary bg-primary/5' 
                    : item.isCompleted 
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    item.isCompleted 
                      ? 'bg-green-500/10 text-green-500' 
                      : item.isCurrent 
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(item.date, "d 'de' MMMM yyyy", { locale: pt })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {formatCurrency(kixikila.contribution_amount * (kixikila.total_members - 1), kixikila.currency)}
                  </p>
                  {item.isCurrent && (
                    <Badge variant="default" className="text-xs">Atual</Badge>
                  )}
                  {item.isCompleted && (
                    <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500">Recebido</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
