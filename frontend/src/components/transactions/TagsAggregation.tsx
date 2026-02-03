import { useState } from 'react';
import { Tag as TagIcon, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useTagsWithStats } from '@/hooks/useTags';
import { formatCurrency } from '@/lib/utils';

export const TagsAggregation = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const { data: tags, isLoading } = useTagsWithStats(selectedMonth);

  const totalAmount = tags?.reduce((sum, t) => sum + t.total_amount, 0) || 0;

  if (isLoading) {
    return <Skeleton className="h-[300px]" />;
  }

  const tagsWithAmount = tags?.filter((t) => t.total_amount > 0) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TagIcon className="h-5 w-5 text-primary" />
          Gastos por Tag
        </CardTitle>
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-40 h-8 text-sm"
        />
      </CardHeader>
      <CardContent>
        {tagsWithAmount.length > 0 ? (
          <div className="space-y-4">
            {tagsWithAmount.map((tag) => {
              const percentage = totalAmount > 0 
                ? (tag.total_amount / totalAmount) * 100 
                : 0;

              return (
                <div key={tag.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          borderColor: `${tag.color}40`,
                        }}
                      >
                        {tag.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {tag.transaction_count} transação(ões)
                      </span>
                    </div>
                    <span className="font-medium text-sm">
                      {formatCurrency(tag.total_amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={percentage}
                      className="h-2 flex-1"
                      style={
                        {
                          '--progress-foreground': tag.color,
                        } as React.CSSProperties
                      }
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TagIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma transação com tags neste mês</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
