import { History, User, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Kixikila, KixikilaMember, KixikilaContribution } from '@/hooks/useKixikilas';
import { formatCurrency } from '@/lib/constants';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface KixikilaHistoryProps {
  kixikila: Kixikila;
  members: KixikilaMember[];
  contributions: KixikilaContribution[];
}

export function KixikilaHistory({ kixikila, members, contributions }: KixikilaHistoryProps) {
  // Group contributions by round
  const roundsHistory = [];
  
  for (let round = 1; round < kixikila.current_round; round++) {
    const roundContributions = contributions.filter(c => c.round_number === round);
    const recipient = members.find(m => m.order_number === round);
    
    roundsHistory.push({
      round,
      recipient,
      contributions: roundContributions,
      totalCollected: roundContributions.reduce((sum, c) => sum + c.amount, 0),
      completedAt: roundContributions.length > 0 
        ? new Date(Math.max(...roundContributions.map(c => new Date(c.paid_at).getTime())))
        : null,
    });
  }

  if (roundsHistory.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico de Rodadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma rodada completa ainda.</p>
            <p className="text-xs">O histórico aparecerá aqui após a primeira rodada.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <History className="h-4 w-4" />
          Histórico de Rodadas ({roundsHistory.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {roundsHistory.reverse().map((round) => (
              <div 
                key={round.round}
                className="p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-green-500">{round.round}</span>
                    </div>
                    <span className="font-medium text-sm">Rodada {round.round}</span>
                  </div>
                  {round.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      {format(round.completedAt, "d MMM yyyy", { locale: pt })}
                    </span>
                  )}
                </div>
                
                {round.recipient && (
                  <div className="flex items-center justify-between p-2 rounded bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{round.recipient.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-500">
                      <Banknote className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {formatCurrency(round.totalCollected, kixikila.currency)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-2 text-xs text-muted-foreground">
                  {round.contributions.length} de {kixikila.total_members} contribuíram
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
