import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SchoolFee } from '@/hooks/useSchoolFees';
import { formatCurrency } from '@/lib/constants';
import { TrendingUp, TrendingDown, Calculator, Target } from 'lucide-react';

interface Props {
  fees: SchoolFee[];
  currency: string;
}

export function SchoolFeeStats({ fees, currency }: Props) {
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentAcademicYear = `${currentYear}/${currentYear + 1}`;
    const previousAcademicYear = `${currentYear - 1}/${currentYear}`;

    const currentYearFees = fees.filter(f => f.academic_year === currentAcademicYear);
    const previousYearFees = fees.filter(f => f.academic_year === previousAcademicYear);

    const currentTotal = currentYearFees.reduce((sum, f) => sum + f.amount, 0);
    const previousTotal = previousYearFees.reduce((sum, f) => sum + f.amount, 0);

    const yearOverYearChange = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0;

    // Estimate remaining for current year (assuming 3 terms)
    const paidTerms = new Set(currentYearFees.filter(f => f.paid).map(f => f.term)).size;
    const avgPerTerm = currentTotal / Math.max(1, new Set(currentYearFees.map(f => f.term)).size);
    const estimatedRemaining = Math.max(0, (3 - paidTerms) * avgPerTerm);

    // Average per student
    const students = new Set(fees.map(f => f.student_name)).size;
    const avgPerStudent = students > 0 ? fees.reduce((sum, f) => sum + f.amount, 0) / students : 0;

    return {
      currentAcademicYear,
      currentTotal,
      previousTotal,
      yearOverYearChange,
      estimatedRemaining,
      avgPerStudent,
      students,
    };
  }, [fees]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Ano Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(stats.currentTotal, currency)}</p>
          <p className="text-xs text-muted-foreground">{stats.currentAcademicYear}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {stats.yearOverYearChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
            Variação Anual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${stats.yearOverYearChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {stats.yearOverYearChange >= 0 ? '+' : ''}{stats.yearOverYearChange.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">vs ano anterior ({formatCurrency(stats.previousTotal, currency)})</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            Previsão Restante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-orange-500">{formatCurrency(stats.estimatedRemaining, currency)}</p>
          <p className="text-xs text-muted-foreground">estimativa até fim do ano</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Média por Estudante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(stats.avgPerStudent, currency)}</p>
          <p className="text-xs text-muted-foreground">{stats.students} estudantes</p>
        </CardContent>
      </Card>
    </div>
  );
}
