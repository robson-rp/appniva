import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SchoolFee, FEE_TYPES } from '@/hooks/useSchoolFees';
import { formatCurrency } from '@/lib/constants';

interface Props {
  fees: SchoolFee[];
  currency: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(262, 80%, 50%)',
  'hsl(180, 70%, 45%)',
];

export function SchoolFeeTypeChart({ fees, currency }: Props) {
  const data = useMemo(() => {
    const byType: Record<string, number> = {};
    
    fees.forEach(fee => {
      if (!byType[fee.fee_type]) {
        byType[fee.fee_type] = 0;
      }
      byType[fee.fee_type] += fee.amount;
    });

    return Object.entries(byType)
      .map(([type, amount]) => ({
        name: FEE_TYPES.find(t => t.value === type)?.label || type,
        value: amount,
        type,
      }))
      .sort((a, b) => b.value - a.value);
  }, [fees]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gastos por Tipo de Despesa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value, currency), 'Valor']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                formatter={(value, entry: any) => {
                  const item = data.find(d => d.name === value);
                  return `${value} (${item ? formatCurrency(item.value, currency) : ''})`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
