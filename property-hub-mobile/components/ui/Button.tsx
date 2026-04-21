import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  label, 
  onPress, 
  variant = 'primary', 
  isLoading, 
  disabled, 
  className,
  size = 'md'
}: ButtonProps) {
  
  let bgClass = 'bg-primary';
  let textClass = 'text-white';
  let borderClass = '';
  
  if (variant === 'secondary') {
    bgClass = 'bg-secondary';
    textClass = 'text-primary';
    borderClass = 'border border-primary-100';
  } else if (variant === 'outline') {
    bgClass = 'bg-transparent';
    textClass = 'text-primary';
    borderClass = 'border-2 border-primary';
  } else if (variant === 'ghost') {
    bgClass = 'bg-transparent';
    textClass = 'text-primary';
  } else if (variant === 'dark') {
    bgClass = 'bg-dark';
    textClass = 'text-white';
  }

  const sizeClasses = {
    sm: 'py-2 px-4 rounded-xl',
    md: 'py-4 px-6 rounded-2xl',
    lg: 'py-5 px-8 rounded-3xl',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || isLoading}
      className={`${sizeClasses[size]} flex-row items-center justify-center ${bgClass} ${borderClass} ${disabled ? 'opacity-50' : ''} ${className}`}
      style={variant === 'primary' ? { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 } : {}}
    >
      {isLoading ? (
        <ActivityIndicator color={textClass.includes('white') ? 'white' : '#2563EB'} />
      ) : (
        <Text className={`text-[10px] font-black uppercase tracking-[0.2em] ${textClass}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
