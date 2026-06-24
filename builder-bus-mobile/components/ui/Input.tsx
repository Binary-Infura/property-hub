import { View, Text, TextInput } from 'react-native';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export function Input({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  error,
  className,
  keyboardType = 'default'
}: InputProps) {
  return (
    <View className={`mb-6 ${className}`}>
      {label && (
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor="#94a3b8"
        className={`w-full px-6 py-4 border ${error ? 'border-rose-500 bg-rose-50/10' : 'border-slate-100 bg-white'} rounded-2xl text-slate-900 font-semibold text-sm shadow-sm shadow-slate-100/50`}
      />
      {error && (
        <Text className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1">{error}</Text>
      )}
    </View>
  );
}
