import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SchoolFee, TERMS } from '@/hooks/useSchoolFees';
import { formatCurrency } from '@/lib/constants';

interface Props {
  fees: SchoolFee[];
  currency: string;
}

export function SchoolFeeEvolutionChart({ fees, currency }: Props) {
  const data = useMemo(() => {
    const byYear: Record<string, Record<string, number>> = {};
    
    fees.forEach(fee => {
      if (!byYear[fee.academic_year]) {
        byYear[fee.academic_year] = { paid: 0, due: 0 };
      }
      if (fee.paid) {
        byYear[fee.academic_year].paid += fee.amount;
      } else {
        byYear[fee.academic_year].due += fee.amount;
      }
    });

    return Object.entries(byYear)
      .map(([year, values]) => ({
        year,
        pago: values.paid,
        pendente: values.due,
        total: values.paid + values.due,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [fees]);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolução por Ano Lectivo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" fontSize={12} />
              <YAxis 
                fontSize={12} 
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value, currency)}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="pago" name="Pago" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendente" name="Pendente" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
