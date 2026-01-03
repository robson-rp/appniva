import nivaLogoFull from '@/assets/niva-logo-full.png';

interface NivaLogoProps {
  variant?: 'full' | 'symbol';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl';
}

const sizeClasses = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
  xl: 'h-12',
  '2xl': 'h-16',
  '3xl': 'h-20',
  '4xl': 'h-24',
  '5xl': 'h-28',
  '6xl': 'h-32',
  '7xl': 'h-36',
  '8xl': 'h-40',
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
