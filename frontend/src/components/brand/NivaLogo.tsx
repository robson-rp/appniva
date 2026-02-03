import nivaLogoFull from '@/assets/niva-logo-new.png';

interface NivaLogoProps {
  variant?: 'full' | 'symbol';
  color?: 'default' | 'white';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl' | '10xl' | '11xl' | '12xl' | '13xl' | '14xl' | '15xl' | '16xl';
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
  '9xl': 'h-44',
  '10xl': 'h-48',
  '11xl': 'h-52',
  '12xl': 'h-56',
  '13xl': 'h-64',
  '14xl': 'h-72',
  '15xl': 'h-80',
  '16xl': 'h-96',
};

export function NivaLogo({ variant = 'full', color = 'default', className = '', size = 'md' }: NivaLogoProps) {
  const colorClass = color === 'white' ? 'brightness-0 invert' : '';
  
  return (
    <img 
      src={nivaLogoFull} 
      alt="NIVA" 
      className={`${sizeClasses[size]} w-auto object-contain ${colorClass} ${className}`}
    />
  );
}
