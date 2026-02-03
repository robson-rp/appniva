import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type MaturityLevel = 'basic' | 'intermediate' | 'advanced';
export type PrimaryGoal = 'control_expenses' | 'save' | 'pay_debts' | 'invest_better';

export interface MaturityProfile {
  id: string;
  user_id: string;
  level: MaturityLevel;
  has_fixed_income: boolean | null;
  uses_budget: boolean | null;
  has_debts: boolean | null;
  has_investments: boolean | null;
  primary_goal: PrimaryGoal | null;
  onboarding_completed: boolean;
  progress_steps_completed: number;
  total_progress_steps: number;
  created_at: string;
  updated_at: string;
}

export interface OnboardingAnswers {
  has_fixed_income: boolean;
  uses_budget: boolean;
  has_debts: boolean;
  has_investments: boolean;
  primary_goal: PrimaryGoal;
}

// Feature access by maturity level
export const FEATURE_ACCESS: Record<string, MaturityLevel> = {
  // Basic features - available to all
  'accounts': 'basic',
  'transactions': 'basic',
  'budgets': 'basic',
  'goals': 'basic',
  
  // Intermediate features
  'debts': 'intermediate',
  'subscriptions': 'intermediate',
  'insights': 'intermediate',
  'school-fees': 'intermediate',
  'recurring': 'intermediate',
  'exchange-rates': 'intermediate',
  
  // Advanced features
  'investments': 'advanced',
  'products': 'advanced',
  'simulator': 'advanced',
  'assistant': 'advanced',
  'reconciliation': 'advanced',
  'ocr/upload': 'advanced',
  'retirement': 'advanced',
  'emergency-fund': 'advanced',
  'kixikilas': 'advanced',
  'remittances': 'advanced',
  'split-expenses': 'advanced',
  'cost-centers': 'advanced',
  'tags': 'advanced',
  'inflation-alerts': 'advanced',
};

// Level hierarchy for comparison
const LEVEL_HIERARCHY: Record<MaturityLevel, number> = {
  'basic': 0,
  'intermediate': 1,
  'advanced': 2,
};

export function calculateMaturityLevel(answers: Partial<OnboardingAnswers>): MaturityLevel {
  const { uses_budget, has_investments, has_debts } = answers;
  
  // Advanced: has investments and either uses budget or manages debts
  if (has_investments && (uses_budget || has_debts)) {
    return 'advanced';
  }
  
  // Intermediate: uses budget or has investments
  if (uses_budget || has_investments) {
    return 'intermediate';
  }
  
  // Basic: default level
  return 'basic';
}

export function hasFeatureAccess(featureRoute: string, userLevel: MaturityLevel): boolean {
  // Remove leading slash if present
  const route = featureRoute.replace(/^\//, '');
  const requiredLevel = FEATURE_ACCESS[route];
  
  // If feature not in the list, allow access (dashboard, profile, etc.)
  if (!requiredLevel) return true;
  
  return LEVEL_HIERARCHY[userLevel] >= LEVEL_HIERARCHY[requiredLevel];
}

export function getRequiredLevel(featureRoute: string): MaturityLevel | null {
  const route = featureRoute.replace(/^\//, '');
  return FEATURE_ACCESS[route] || null;
}

export function getLevelDisplayName(level: MaturityLevel): string {
  const names: Record<MaturityLevel, string> = {
    'basic': 'Básico',
    'intermediate': 'Intermédio',
    'advanced': 'Avançado',
  };
  return names[level];
}

export function useMaturityProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: maturityProfile, isLoading, error } = useQuery({
    queryKey: ['maturityProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_maturity_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Return null if no profile found (user needs to complete smart onboarding)
      return data as MaturityProfile | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const createProfile = useMutation({
    mutationFn: async (answers: OnboardingAnswers) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const level = calculateMaturityLevel(answers);
      
      const { data, error } = await supabase
        .from('user_maturity_profiles')
        .insert({
          user_id: user.id,
          ...answers,
          level,
          onboarding_completed: true,
          progress_steps_completed: 1,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as MaturityProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maturityProfile'] });
    },
    onError: (error) => {
      console.error('Error creating maturity profile:', error);
      toast.error('Erro ao criar perfil de maturidade');
    },
  });

  const updateProgress = useMutation({
    mutationFn: async (stepsCompleted: number) => {
      if (!user?.id || !maturityProfile) throw new Error('Profile not found');
      
      const { data, error } = await supabase
        .from('user_maturity_profiles')
        .update({
          progress_steps_completed: stepsCompleted,
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as MaturityProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maturityProfile'] });
    },
  });

  const upgradeLevel = useMutation({
    mutationFn: async (newLevel: MaturityLevel) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_maturity_profiles')
        .update({ level: newLevel })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as MaturityProfile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maturityProfile'] });
      toast.success(`Parabéns! Avançou para o nível ${getLevelDisplayName(data.level)}!`);
    },
  });

  return {
    maturityProfile,
    isLoading,
    error,
    createProfile,
    updateProgress,
    upgradeLevel,
    hasAccess: (featureRoute: string) => 
      hasFeatureAccess(featureRoute, maturityProfile?.level || 'basic'),
    level: maturityProfile?.level || 'basic',
  };
}
