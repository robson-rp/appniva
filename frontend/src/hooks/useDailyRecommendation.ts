import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Priority = 'low' | 'medium' | 'high';

interface DailyRecommendation {
  id: string;
  user_id: string;
  title: string;
  message: string;
  action_label: string;
  action_route: string;
  priority: Priority;
  generated_at: string;
  created_at: string;
}

export function useDailyRecommendation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['daily-recommendation', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const response = await api.get('daily-recommendations');
      return response.data as DailyRecommendation;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const refresh = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const response = await api.post('daily-recommendations/refresh', {});
      return response.data as DailyRecommendation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-recommendation'] });
    },
  });

  return {
    recommendation: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refresh: refresh.mutate,
    isRefreshing: refresh.isPending,
  };
}
