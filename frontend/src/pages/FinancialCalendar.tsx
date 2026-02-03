import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useDebts } from '@/hooks/useDebts';
import { useSchoolFees } from '@/hooks/useSchoolFees';
import { useGoals } from '@/hooks/useGoals';
import { formatCompactCurrency, formatDate } from '@/lib/constants';
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  CalendarDays, 
  RefreshCw, 
  CreditCard, 
  GraduationCap, 
  Target, 
  Banknote,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  amount: number;
  type: 'recurring' | 'subscription' | 'debt' | 'school_fee' | 'goal';
  currency?: string;
}

export default function FinancialCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const { data: recurring } = useRecurringTransactions();
  const { data: subscriptions } = useSubscriptions();
  const { data: debts } = useDebts();
  const { data: schoolFees } = useSchoolFees();
  const { data: goals } = useGoals();

  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Add recurring transactions
    recurring?.filter(r => r.is_active).forEach(tx => {
      const nextDate = new Date(tx.next_execution_date);
      if (isWithinInterval(nextDate, { start: monthStart, end: monthEnd })) {
        allEvents.push({
          id: `recurring-${tx.id}`,
          date: nextDate,
          title: tx.description,
          amount: tx.amount,
          type: 'recurring',
        });
      }
    });

    // Add subscriptions
    subscriptions?.filter(s => s.is_active).forEach(sub => {
      const renewalDate = new Date(sub.next_renewal_date);
      if (isWithinInterval(renewalDate, { start: monthStart, end: monthEnd })) {
        allEvents.push({
          id: `sub-${sub.id}`,
          date: renewalDate,
          title: sub.name,
          amount: sub.amount,
          type: 'subscription',
          currency: sub.currency,
        });
      }
    });

    // Add debt payments
    debts?.filter(d => d.status === 'active' && d.next_payment_date).forEach(debt => {
      const paymentDate = new Date(debt.next_payment_date!);
      if (isWithinInterval(paymentDate, { start: monthStart, end: monthEnd })) {
        allEvents.push({
          id: `debt-${debt.id}`,
          date: paymentDate,
          title: debt.name,
          amount: debt.installment_amount,
          type: 'debt',
          currency: debt.currency,
        });
      }
    });

    // Add school fees
    schoolFees?.filter(sf => !sf.paid).forEach(fee => {
      const dueDate = new Date(fee.due_date);
      if (isWithinInterval(dueDate, { start: monthStart, end: monthEnd })) {
        allEvents.push({
          id: `school-${fee.id}`,
          date: dueDate,
          title: `${fee.student_name} - ${fee.fee_type}`,
          amount: fee.amount,
          type: 'school_fee',
          currency: fee.currency,
        });
      }
    });

    // Add goal target dates
    goals?.filter(g => g.status === 'in_progress' && g.target_date).forEach(goal => {
      const targetDate = new Date(goal.target_date!);
      if (isWithinInterval(targetDate, { start: monthStart, end: monthEnd })) {
        allEvents.push({
          id: `goal-${goal.id}`,
          date: targetDate,
          title: goal.name,
          amount: goal.target_amount - (goal.current_saved_amount || 0),
          type: 'goal',
          currency: goal.currency,
        });
      }
    });

    return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [recurring, subscriptions, debts, schoolFees, goals, currentMonth]);

  const selectedDateEvents = events.filter(e => isSameDay(e.date, selectedDate));
  
  const upcomingEvents = events
    .filter(e => e.date >= new Date())
    .slice(0, 10);

  const totalThisMonth = events.reduce((sum, e) => sum + e.amount, 0);

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'recurring': return <RefreshCw className="h-4 w-4" />;
      case 'subscription': return <CreditCard className="h-4 w-4" />;
      case 'debt': return <Banknote className="h-4 w-4" />;
      case 'school_fee': return <GraduationCap className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'recurring': return 'bg-blue-500';
      case 'subscription': return 'bg-purple-500';
      case 'debt': return 'bg-red-500';
      case 'school_fee': return 'bg-amber-500';
      case 'goal': return 'bg-green-500';
    }
  };

  const getEventBadgeVariant = (type: CalendarEvent['type']): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'debt': return 'destructive';
      case 'goal': return 'default';
      default: return 'secondary';
    }
  };

  const daysWithEvents = events.map(e => e.date);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendário Financeiro</h1>
          <p className="text-muted-foreground">Visualize todas as suas obrigações financeiras</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary truncate">
              {formatCompactCurrency(totalThisMonth)}
            </div>
            <p className="text-sm text-muted-foreground">Total este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-sm text-muted-foreground">Eventos este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-500">
              {events.filter(e => e.date <= addDays(new Date(), 7) && e.date >= new Date()).length}
            </div>
            <p className="text-sm text-muted-foreground">Próximos 7 dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">
              {events.filter(e => e.type === 'debt').length}
            </div>
            <p className="text-sm text-muted-foreground">Pagamentos de dívidas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>{format(currentMonth, 'MMMM yyyy', { locale: pt })}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={pt}
              className="rounded-md border w-full"
              modifiers={{
                hasEvent: daysWithEvents,
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textDecorationColor: 'hsl(var(--primary))',
                }
              }}
            />
            
            {/* Selected Date Events */}
            {selectedDateEvents.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">
                  Eventos em {format(selectedDate, "d 'de' MMMM", { locale: pt })}
                </h4>
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 text-white ${getEventColor(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <Badge variant={getEventBadgeVariant(event.type)} className="text-xs">
                          {event.type === 'recurring' && 'Recorrente'}
                          {event.type === 'subscription' && 'Subscrição'}
                          {event.type === 'debt' && 'Dívida'}
                          {event.type === 'school_fee' && 'Propina'}
                          {event.type === 'goal' && 'Meta'}
                        </Badge>
                      </div>
                    </div>
                    <span className="font-bold">{formatCompactCurrency(event.amount, event.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Próximos Eventos
            </CardTitle>
            <CardDescription>Obrigações financeiras a vir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Sem eventos próximos
                </p>
              ) : (
                upcomingEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedDate(event.date)}
                  >
                    <div className={`rounded-full p-2 text-white ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(event.date, "d MMM", { locale: pt })}
                      </p>
                    </div>
                    <span className="font-bold text-sm whitespace-nowrap">
                      {formatCompactCurrency(event.amount, event.currency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm">Transações Recorrentes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="text-sm">Subscrições</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm">Pagamentos de Dívidas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-sm">Propinas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm">Metas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
