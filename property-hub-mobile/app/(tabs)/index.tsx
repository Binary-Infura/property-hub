import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Briefcase, FileText, IndianRupee, LayoutDashboard, ShoppingBag, ArrowRight, ShieldCheck, Zap } from 'lucide-react-native';
import { propertyService } from '../../services/propertyService';

export default function BuyerDashboard() {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    savedCount: 0,
    loanStatus: 'In Review',
    docCount: 2
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const projects = await propertyService.getAll(token || null, undefined, undefined, 1, 5);
      setStats(prev => ({ ...prev, savedCount: projects.total || 0 }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-8">
          {/* Header Section */}
          <View className="bg-primary rounded-5xl p-8 mb-8 shadow-2xl shadow-primary/30 overflow-hidden relative">
            {/* Decorative background element */}
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            
            <View className="flex-row items-center gap-2 mb-2">
              <Zap size={14} color="#dbeafe" fill="#dbeafe" />
              <Text className="text-[10px] font-black text-primary-100 uppercase tracking-[0.3em]">Premium Access</Text>
            </View>
            
            <Text className="text-3xl font-black text-white tracking-tighter leading-none mb-2">
              Welcome back,{'\n'}
              <Text className="text-secondary">{user?.firstName || 'Partner'}</Text>
            </Text>
            <Text className="text-primary-100 font-semibold text-sm opacity-90 mb-8 max-w-[80%]">
              Manage your property portfolio and financial journey with ease.
            </Text>
            
            <View className="flex-row gap-3">
              <Button 
                label="Marketplace" 
                variant="secondary" 
                size="sm" 
                onPress={() => {}} 
                className="flex-1"
              />
              <Button 
                label="Shortlist" 
                variant="dark" 
                size="sm" 
                onPress={() => {}} 
                className="flex-1"
              />
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row gap-4 mb-8">
            <Card className="flex-1 p-5 items-start">
              <View className="w-12 h-12 bg-primary-50 rounded-2xl items-center justify-center mb-4 border border-primary-100">
                <ShoppingBag size={22} color="#0056cc" />
              </View>
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Shortlist</Text>
              <View className="flex-row items-end gap-1">
                <Text className="text-2xl font-black text-slate-900 tracking-tighter">
                  {stats.savedCount.toString().padStart(2, '0')}
                </Text>
                <Text className="text-[10px] font-bold text-slate-400 mb-1">Items</Text>
              </View>
            </Card>

            <Card className="flex-1 p-5 items-start">
              <View className="w-12 h-12 bg-amber-50 rounded-2xl items-center justify-center mb-4 border border-amber-100">
                <IndianRupee size={22} color="#b45309" />
              </View>
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Financing</Text>
              <View className="bg-amber-100/50 px-2.5 py-1 rounded-full border border-amber-200/50 mt-1">
                <Text className="text-[9px] font-black text-amber-700 uppercase tracking-widest text-center">In Review</Text>
              </View>
            </Card>
          </View>

          {/* Compliance Card */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-5 px-1">
              <View>
                <Text className="text-lg font-black text-slate-900 tracking-tight leading-none">Portfolio Health</Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Updates available</Text>
              </View>
              <TouchableOpacity className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-slate-100 shadow-sm">
                <FileText size={18} color="#2563EB" />
              </TouchableOpacity>
            </View>
            
            <Card className="p-8">
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center gap-2">
                  <ShieldCheck size={16} color="#10b981" />
                  <Text className="text-sm font-bold text-slate-700">Document Compliance</Text>
                </View>
                <Text className="text-xs font-black text-primary">{stats.docCount}/6 Secure</Text>
              </View>
              
              <View className="h-2.5 bg-slate-50 rounded-full overflow-hidden mb-8 border border-slate-100">
                <View className="h-full bg-primary rounded-full shadow-lg shadow-primary" style={{ width: `${(stats.docCount/6)*100}%` }} />
              </View>
              
              <Button 
                label="Verify Documents Now" 
                variant="outline" 
                onPress={() => {}} 
                className="w-full"
              />
            </Card>
          </View>

          {/* Action Logut */}
          <TouchableOpacity 
            onPress={logout}
            activeOpacity={0.7}
            className="py-5 bg-dark rounded-3xl items-center shadow-xl shadow-slate-900/30"
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Secure Logout</Text>
              <ArrowRight size={14} color="white" />
            </View>
          </TouchableOpacity>
          
          <Text className="text-center text-[10px] text-slate-400 font-bold mt-12 mb-8 uppercase tracking-[0.1em]">
            PropertyHub Mobile • Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
