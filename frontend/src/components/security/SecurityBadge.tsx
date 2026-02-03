import { Shield, Lock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SecurityBadgeProps {
  variant?: 'protected' | 'privacy' | 'control';
  size?: 'sm' | 'md';
  showText?: boolean;
}

export function SecurityBadge({ variant = 'protected', size = 'sm', showText = true }: SecurityBadgeProps) {
  const { t } = useTranslation();

  const badges = {
    protected: {
      icon: Lock,
      text: t('security.badges.protected', 'Dados protegidos'),
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
    privacy: {
      icon: Shield,
      text: t('security.badges.privacy', 'Privacidade garantida'),
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    control: {
      icon: CheckCircle,
      text: t('security.badges.control', 'Controlo total'),
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
  };

  const badge = badges[variant];
  const Icon = badge.icon;
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';

  return (
    <div className={`inline-flex items-center gap-1.5 ${badge.bg} ${padding} rounded-full`}>
      <Icon className={`${iconSize} ${badge.color}`} />
      {showText && (
        <span className={`${textSize} font-medium ${badge.color}`}>
          {badge.text}
        </span>
      )}
    </div>
  );
}
