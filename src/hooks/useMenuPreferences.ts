import { useState, useEffect } from 'react';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  hasBadge?: boolean;
}

const STORAGE_KEY = 'menu-preferences';

// Default pinned items
const DEFAULT_PINNED = ['/dashboard', '/assistant', '/accounts', '/transactions'];

export function useMenuPreferences() {
  const [pinnedItems, setPinnedItems] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PINNED;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedItems));
  }, [pinnedItems]);

  const togglePin = (path: string) => {
    setPinnedItems(prev => 
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const isPinned = (path: string) => pinnedItems.includes(path);

  const resetToDefault = () => {
    setPinnedItems(DEFAULT_PINNED);
  };

  return {
    pinnedItems,
    togglePin,
    isPinned,
    resetToDefault,
  };
}
