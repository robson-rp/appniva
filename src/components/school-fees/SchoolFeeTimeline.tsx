import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SchoolFee, TERMS } from '@/hooks/useSchoolFees';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/constants';

interface Props {
  fees: SchoolFee[];
  academicYear: string;
}

export function SchoolFeeTimeline({ fees, academicYear }: Props) {
  const yearFees = fees.filter(f => f.academic_year === academicYear);
  
  const termData = useMemo(() => {
    return TERMS.map(term => {
      const termFees = yearFees.filter(f => f.term === term.value);
      const total = termFees.reduce((sum, f) => sum + f.amount, 0);
      const paid = termFees.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0);
      const allPaid = termFees.length > 0 && termFees.every(f => f.paid);
      const hasPending = termFees.some(f => !f.paid);
      
      return {
        ...term,
        total,
        paid,
        allPaid,
        hasPending,
        count: termFees.length,
      };
    }).filter(t => t.count > 0);
  }, [yearFees]);

  const totalAmount = yearFees.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = yearFees.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0);
  const progressPercent = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  if (yearFees.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Timeline {academicYear}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso do Ano</span>
            <span className="font-medium">{progressPercent.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(paidAmount, 'AOA')} pago</span>
            <span>{formatCurrency(totalAmount - paidAmount, 'AOA')} restante</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-4">
            {termData.map((term, index) => (
              <div key={term.value} className="relative pl-10">
                <div className={`absolute left-2 top-1 h-5 w-5 rounded-full flex items-center justify-center ${
                  term.allPaid 
                    ? 'bg-green-500 text-white' 
                    : term.hasPending 
                      ? 'bg-orange-500 text-white'
                      : 'bg-muted'
                }`}>
                  {term.allPaid ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : term.hasPending ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{term.label}</p>
                    <span className="text-xs text-muted-foreground">{term.count} propinas</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {term.allPaid ? 'Tudo pago' : `${formatCurrency(term.paid, 'AOA')} de ${formatCurrency(term.total, 'AOA')}`}
                    </span>
                    {!term.allPaid && (
                      <span className="text-xs font-medium text-orange-500">
                        Falta {formatCurrency(term.total - term.paid, 'AOA')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
