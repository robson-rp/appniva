import { SecurityBadge } from './SecurityBadge';

interface SecurityBadgesRowProps {
  showText?: boolean;
  size?: 'sm' | 'md';
}

export function SecurityBadgesRow({ showText = true, size = 'sm' }: SecurityBadgesRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <SecurityBadge variant="protected" size={size} showText={showText} />
      <SecurityBadge variant="privacy" size={size} showText={showText} />
      <SecurityBadge variant="control" size={size} showText={showText} />
    </div>
  );
}
