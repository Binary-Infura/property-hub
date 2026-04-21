import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { otpService } from '../services/otpService';
import { ShieldCheck, ArrowLeft, KeyRound, Smartphone } from 'lucide-react-native';

export default function SignInScreen() {
  const { loginWithCredentials, loginWithOtp } = useAuth();
  const router = useRouter();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (!identifier || (loginMethod === 'password' && !password)) {
        throw new Error('Please enter your credentials');
      }

      if (loginMethod === 'password') {
        const result = await loginWithCredentials(identifier, password);
        if (result.success) {
          router.replace('/(tabs)');
        } else {
          setError(result.error || 'Authentication failed');
        }
      } else {
        if (!otpSent) {
          const result = await otpService.sendOtp(
            identifier.includes('@') ? undefined : identifier,
            identifier.includes('@') ? identifier : undefined,
            true
          );
          if (result.success) {
            setOtpSent(true);
          } else {
            setError(result.error || 'Failed to send OTP');
          }
        } else {
          const result = await loginWithOtp(
            otpValue,
            identifier.includes('@') ? undefined : identifier,
            identifier.includes('@') ? identifier : undefined
          );
          if (result.success) {
            router.replace('/(tabs)');
          } else {
            setError(result.error || 'OTP verification failed');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          className="px-8 py-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center max-w-md mx-auto w-full">
            <View className="items-center mb-12">
              <View className="w-16 h-16 bg-primary rounded-3xl items-center justify-center mb-6 shadow-2xl shadow-primary/40">
                <ShieldCheck color="white" size={32} />
              </View>
              <Text className="text-3xl font-black text-slate-900 tracking-tighter">PropertyHub</Text>
              <Text className="text-sm font-semibold text-slate-400 mt-2 text-center max-w-[80%]">
                Your premium portal for property management and analytics.
              </Text>
            </View>

            <View className="flex-row bg-slate-50/50 p-2 rounded-3xl mb-10 border border-slate-100">
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => { setLoginMethod('password'); setOtpSent(false); setError(''); }}
                className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl ${loginMethod === 'password' ? 'bg-white shadow-md' : ''}`}
              >
                <KeyRound size={14} color={loginMethod === 'password' ? '#2563EB' : '#94a3b8'} className="mr-2" />
                <Text className={`text-[10px] font-black uppercase tracking-widest ${loginMethod === 'password' ? 'text-primary' : 'text-slate-400'}`}>Password</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => { setLoginMethod('otp'); setOtpSent(false); setError(''); }}
                className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl ${loginMethod === 'otp' ? 'bg-white shadow-md' : ''}`}
              >
                <Smartphone size={14} color={loginMethod === 'otp' ? '#2563EB' : '#94a3b8'} className="mr-2" />
                <Text className={`text-[10px] font-black uppercase tracking-widest ${loginMethod === 'otp' ? 'text-primary' : 'text-slate-400'}`}>OTP Login</Text>
              </TouchableOpacity>
            </View>

            <Card className="px-8 py-10">
              <Input 
                label={identifier.includes('@') ? 'Email Address' : 'Phone or Email'}
                value={identifier}
                onChangeText={setIdentifier}
                placeholder={loginMethod === 'otp' ? "e.g. +91 9876543210" : "you@propertyhub.com"}
                disabled={otpSent && loginMethod === 'otp'}
              />

              {loginMethod === 'password' ? (
                <Input 
                  label="Secure Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                />
              ) : (
                otpSent && (
                  <Input 
                    label="Verification Code"
                    value={otpValue}
                    onChangeText={setOtpValue}
                    placeholder="1234"
                    keyboardType="numeric"
                  />
                )
              )}

              {error ? (
                <View className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                  <Text className="text-rose-600 text-xs font-bold text-center leading-relaxed">{error}</Text>
                </View>
              ) : null}

              <Button 
                label={isLoading ? 'Processing...' : (loginMethod === 'password' ? 'Sign In Securely' : (otpSent ? 'Verify & Login' : 'Get Verification Code'))}
                onPress={handleSubmit}
                isLoading={isLoading}
                variant="primary"
                className="w-full"
              />

              <TouchableOpacity className="mt-8 items-center">
                <Text className="text-xs text-slate-400 font-semibold">
                  Don't have an account? <Text className="font-black text-primary">Request Access</Text>
                </Text>
              </TouchableOpacity>
            </Card>

            <View className="mt-16 items-center">
              <Text className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                Enterprise Security • Hub v2.0
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
