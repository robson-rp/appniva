import { useState, useEffect, useCallback } from 'react';

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
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(DEFAULT_FEATURES);

  // Load from localStorage on mount
  useEffect(() => {
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
  }, []);

  // Save to localStorage
  const saveFeatures = useCallback((features: string[]) => {
    const trimmed = features.slice(0, MAX_FEATURES);
    setSelectedFeatures(trimmed);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save mobile home preferences:', e);
    }
  }, []);

  // Toggle a feature
  const toggleFeature = useCallback((featureId: string) => {
    setSelectedFeatures(current => {
      let newFeatures: string[];
      if (current.includes(featureId)) {
        // Remove feature
        newFeatures = current.filter(id => id !== featureId);
      } else if (current.length < MAX_FEATURES) {
        // Add feature
        newFeatures = [...current, featureId];
      } else {
        // At max, don't add
        return current;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFeatures));
      return newFeatures;
    });
  }, []);

  // Move feature up/down
  const moveFeature = useCallback((featureId: string, direction: 'up' | 'down') => {
    setSelectedFeatures(current => {
      const index = current.indexOf(featureId);
      if (index === -1) return current;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= current.length) return current;
      
      const newFeatures = [...current];
      [newFeatures[index], newFeatures[newIndex]] = [newFeatures[newIndex], newFeatures[index]];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFeatures));
      return newFeatures;
    });
  }, []);

  // Reset to defaults
  const resetToDefault = useCallback(() => {
    setSelectedFeatures(DEFAULT_FEATURES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FEATURES));
  }, []);

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
  };
}
