import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'flat' | 'primary';
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  let bgClass = 'bg-white';
  let shadowClass = 'shadow-xl shadow-slate-200/50';
  let borderClass = 'border border-slate-100';

  if (variant === 'flat') {
    shadowClass = '';
    bgClass = 'bg-slate-50/50';
  } else if (variant === 'primary') {
    bgClass = 'bg-primary-50';
    borderClass = 'border border-primary-100';
  }

  return (
    <View 
      className={`${bgClass} rounded-4xl ${shadowClass} ${borderClass} p-6 ${className}`}
    >
      {children}
    </View>
  );
}
