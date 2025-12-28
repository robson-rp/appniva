import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Kixikila } from '@/hooks/useKixikilas';
import { formatCurrency } from '@/lib/constants';

interface KixikilaProgressChartProps {
  kixikila: Kixikila;
}

export function KixikilaProgressChart({ kixikila }: KixikilaProgressChartProps) {
  const completedRounds = kixikila.current_round - 1;
  const remainingRounds = kixikila.total_members - completedRounds;
  const progress = (completedRounds / kixikila.total_members) * 100;
  
  const data = [
    { name: 'Completas', value: completedRounds, color: 'hsl(var(--primary))' },
    { name: 'Atual', value: 1, color: 'hsl(var(--chart-2))' },
    { name: 'Restantes', value: Math.max(0, remainingRounds - 1), color: 'hsl(var(--muted))' },
  ].filter(d => d.value > 0);

  const totalPot = kixikila.contribution_amount * kixikila.total_members;
  const totalDistributed = kixikila.contribution_amount * (kixikila.total_members - 1) * completedRounds;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Progresso do Ciclo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative h-32 w-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Completas</span>
              </div>
              <span className="font-medium">{completedRounds}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                <span>Atual</span>
              </div>
              <span className="font-medium">1</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted" />
                <span>Restantes</span>
              </div>
              <span className="font-medium">{Math.max(0, remainingRounds - 1)}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Total do Pote</p>
            <p className="font-semibold">{formatCurrency(totalPot, kixikila.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Já Distribuído</p>
            <p className="font-semibold text-primary">{formatCurrency(totalDistributed, kixikila.currency)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
