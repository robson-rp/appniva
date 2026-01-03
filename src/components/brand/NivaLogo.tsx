import nivaLogoFull from '@/assets/niva-logo-full.png';

interface NivaLogoProps {
  variant?: 'full' | 'symbol';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const sizeClasses = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
  xl: 'h-12',
  '2xl': 'h-16',
  '3xl': 'h-20',
};

export function NivaLogo({ variant = 'full', className = '', size = 'md' }: NivaLogoProps) {
  return (
    <img 
      src={nivaLogoFull} 
      alt="NIVA" 
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
    />
  );
}
