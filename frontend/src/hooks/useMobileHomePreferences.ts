import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// All available feature items for the mobile home
export const ALL_MOBILE_FEATURES = [
  { id: 'accounts', route: '/accounts', labelKey: 'nav.accounts', color: 'bg-blue-500', iconName: 'Wallet' },
  { id: 'transactions', route: '/transactions', labelKey: 'nav.transactions', color: 'bg-emerald-500', iconName: 'ArrowUpDown' },
  { id: 'budgets', route: '/budgets', labelKey: 'nav.budgets', color: 'bg-purple-500', iconName: 'PiggyBank' },
  { id: 'investments', route: '/investments', labelKey: 'nav.investments', color: 'bg-amber-500', iconName: 'TrendingUp' },
  { id: 'goals', route: '/goals', labelKey: 'nav.goals', color: 'bg-pink-500', iconName: 'Target' },
  { id: 'school-fees', route: '/school-fees', labelKey: 'nav.schoolFees', color: 'bg-indigo-500', iconName: 'Calendar' },
  { id: 'subscriptions', route: '/subscriptions', labelKey: 'nav.subscriptions', color: 'bg-teal-500', iconName: 'RefreshCw' },
  { id: 'debts', route: '/debts', labelKey: 'nav.debts', color: 'bg-red-500', iconName: 'CreditCard' },
  { id: 'dashboard', route: '/dashboard', labelKey: 'nav.dashboard', color: 'bg-cyan-500', iconName: 'BarChart3' },
  { id: 'insights', route: '/insights', labelKey: 'nav.insights', color: 'bg-yellow-500', iconName: 'Lightbulb' },
  { id: 'assistant', route: '/assistant', labelKey: 'nav.assistant', color: 'bg-violet-500', iconName: 'MessageCircle' },
  { id: 'simulator', route: '/simulator', labelKey: 'nav.simulator', color: 'bg-orange-500', iconName: 'Calculator' },
  { id: 'recurring', route: '/recurring', labelKey: 'nav.recurring', color: 'bg-lime-500', iconName: 'Repeat' },
  { id: 'exchange-rates', route: '/exchange-rates', labelKey: 'nav.exchangeRates', color: 'bg-sky-500', iconName: 'DollarSign' },
  { id: 'kixikilas', route: '/kixikilas', labelKey: 'nav.kixikilas', color: 'bg-rose-500', iconName: 'Users' },
  { id: 'remittances', route: '/remittances', labelKey: 'nav.remittances', color: 'bg-fuchsia-500', iconName: 'Send' },
  { id: 'split-expenses', route: '/split-expenses', labelKey: 'nav.splitExpenses', color: 'bg-emerald-600', iconName: 'Receipt' },
  { id: 'ocr', route: '/ocr/upload', labelKey: 'nav.ocr', color: 'bg-slate-500', iconName: 'ScanText' },
] as const;

// Default 12 features for mobile home
const DEFAULT_FEATURES = [
  'accounts',
  'transactions', 
  'budgets',
  'investments',
  'goals',
  'school-fees',
  'subscriptions',
  'debts',
  'dashboard',
  'insights',
  'assistant',
  'simulator',
];

const STORAGE_KEY = 'mobile-home-features';
const MAX_FEATURES = 12;

export function useMobileHomePreferences() {
  const { user } = useAuth();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(DEFAULT_FEATURES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load preferences from database or localStorage
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      
      if (user) {
        // Try to load from database for authenticated users
        const { data, error } = await supabase
          .from('user_mobile_preferences')
          .select('selected_features')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!error && data?.selected_features) {
          setSelectedFeatures(data.selected_features.slice(0, MAX_FEATURES));
        } else {
          // If no DB data, try localStorage and sync to DB
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const features = parsed.slice(0, MAX_FEATURES);
                setSelectedFeatures(features);
                // Sync localStorage preferences to database
                await supabase.from('user_mobile_preferences').upsert({
                  user_id: user.id,
                  selected_features: features,
                });
              }
            } catch (e) {
              console.error('Failed to parse stored preferences:', e);
            }
          } else {
            // No preferences anywhere, create default in DB
            await supabase.from('user_mobile_preferences').upsert({
              user_id: user.id,
              selected_features: DEFAULT_FEATURES,
            });
          }
        }
      } else {
        // Load from localStorage for unauthenticated users
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSelectedFeatures(parsed.slice(0, MAX_FEATURES));
            }
          }
        } catch (e) {
          console.error('Failed to load mobile home preferences:', e);
        }
      }
      
      setIsLoading(false);
    };

    loadPreferences();
  }, [user]);

  // Save to database and localStorage
  const saveFeatures = useCallback(async (features: string[]) => {
    const trimmed = features.slice(0, MAX_FEATURES);
    setSelectedFeatures(trimmed);
    
    // Always save to localStorage as backup
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    
    // Save to database if authenticated
    if (user) {
      setIsSyncing(true);
      await supabase.from('user_mobile_preferences').upsert({
        user_id: user.id,
        selected_features: trimmed,
      });
      setIsSyncing(false);
    }
  }, [user]);

  // Toggle a feature
  const toggleFeature = useCallback((featureId: string) => {
    setSelectedFeatures(current => {
      let newFeatures: string[];
      if (current.includes(featureId)) {
        newFeatures = current.filter(id => id !== featureId);
      } else if (current.length < MAX_FEATURES) {
        newFeatures = [...current, featureId];
      } else {
        return current;
      }
      
      // Save asynchronously
      saveFeatures(newFeatures);
      return newFeatures;
    });
  }, [saveFeatures]);

  // Move feature up/down
  const moveFeature = useCallback((featureId: string, direction: 'up' | 'down') => {
    setSelectedFeatures(current => {
      const index = current.indexOf(featureId);
      if (index === -1) return current;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= current.length) return current;
      
      const newFeatures = [...current];
      [newFeatures[index], newFeatures[newIndex]] = [newFeatures[newIndex], newFeatures[index]];
      
      // Save asynchronously
      saveFeatures(newFeatures);
      return newFeatures;
    });
  }, [saveFeatures]);

  // Reset to defaults
  const resetToDefault = useCallback(() => {
    saveFeatures(DEFAULT_FEATURES);
  }, [saveFeatures]);

  // Check if feature is selected
  const isSelected = useCallback((featureId: string) => {
    return selectedFeatures.includes(featureId);
  }, [selectedFeatures]);

  // Get full feature data for selected features (in order)
  const getSelectedFeatureData = useCallback(() => {
    return selectedFeatures
      .map(id => ALL_MOBILE_FEATURES.find(f => f.id === id))
      .filter(Boolean);
  }, [selectedFeatures]);

  return {
    selectedFeatures,
    allFeatures: ALL_MOBILE_FEATURES,
    toggleFeature,
    moveFeature,
    resetToDefault,
    isSelected,
    getSelectedFeatureData,
    maxFeatures: MAX_FEATURES,
    canAddMore: selectedFeatures.length < MAX_FEATURES,
    isLoading,
    isSyncing,
  };
}
