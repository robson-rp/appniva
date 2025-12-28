import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { SchoolFee } from '@/hooks/useSchoolFees';
import { formatCurrency, formatDate } from '@/lib/constants';
import { format, isSameDay, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Props {
  fees: SchoolFee[];
}

export function SchoolFeeCalendar({ fees }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const dueDates = useMemo(() => {
    return fees.filter(f => !f.paid).map(f => parseISO(f.due_date));
  }, [fees]);

  const selectedFees = useMemo(() => {
    if (!selectedDate) return [];
    return fees.filter(f => isSameDay(parseISO(f.due_date), selectedDate));
  }, [fees, selectedDate]);

  const modifiers = useMemo(() => {
    const overdue = fees
      .filter(f => !f.paid && parseISO(f.due_date) < new Date())
      .map(f => parseISO(f.due_date));
    
    const upcoming = fees
      .filter(f => !f.paid && parseISO(f.due_date) >= new Date())
      .map(f => parseISO(f.due_date));

    return { overdue, upcoming };
  }, [fees]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Calendário de Vencimentos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row gap-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={pt}
          modifiers={modifiers}
          modifiersStyles={{
            overdue: { backgroundColor: 'hsl(var(--destructive))', color: 'white', borderRadius: '50%' },
            upcoming: { backgroundColor: 'hsl(var(--primary))', color: 'white', borderRadius: '50%' },
          }}
          className="rounded-md border"
        />
        <div className="flex-1 min-w-0">
          {selectedDate && selectedFees.length > 0 ? (
            <div className="space-y-2">
              <p className="font-medium text-sm">
                {format(selectedDate, "d 'de' MMMM", { locale: pt })}
              </p>
              {selectedFees.map(fee => (
                <div key={fee.id} className="p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{fee.student_name}</p>
                    <Badge variant={fee.paid ? 'default' : 'secondary'}>
                      {fee.paid ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{fee.school_name}</p>
                  <p className="text-sm font-bold mt-1">{formatCurrency(fee.amount, fee.currency)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              {selectedDate ? 'Nenhuma propina nesta data' : 'Selecione uma data para ver detalhes'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
