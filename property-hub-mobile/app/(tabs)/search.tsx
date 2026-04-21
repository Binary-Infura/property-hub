import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, RefreshControl, Image, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MapPin, Search as SearchIcon, Filter, IndianRupee, BedDouble, Move, Sparkles, ChevronRight } from 'lucide-react-native';
import { propertyService } from '../../services/propertyService';

export default function PropertySearch() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getAll(token || null, undefined, 'APPROVED', 1, 20, searchQuery);
      setProperties(data.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [token, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const renderProperty = ({ item }: { item: any }) => (
    <Card className="mb-8 overflow-hidden p-0 border-slate-100 shadow-2xl shadow-slate-200/40">
      <View className="h-56 bg-slate-100 relative">
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-slate-50">
            <Sparkles size={32} color="#cbd5e1" />
            <Text className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] mt-4">Premium Listing</Text>
          </View>
        )}
        <View className="absolute top-5 left-5 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
          <Text className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{item.projectType || 'Verified'}</Text>
        </View>
        
        {/* Price tag overlay */}
        <View className="absolute bottom-5 right-5 bg-dark px-4 py-2 rounded-2xl shadow-xl border border-white/10">
           <Text className="text-white font-black text-base tracking-tighter">₹{(Number(item.price) / 100000).toFixed(1)}L+</Text>
        </View>
      </View>
      
      <View className="p-6">
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 mr-4">
            <Text className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-2" numberOfLines={1}>{item.name}</Text>
            <View className="flex-row items-center">
              <MapPin size={12} color="#2563EB" />
              <Text className="text-xs font-semibold text-slate-500 ml-1.5" numberOfLines={1}>{item.location}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-6 py-5 border-y border-slate-50 mt-2 mb-6">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-slate-50 rounded-lg items-center justify-center mr-3 border border-slate-100">
                <BedDouble size={14} color="#64748b" />
            </View>
            <View>
                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Config</Text>
                <Text className="text-xs font-black text-slate-700 leading-none">{item.bedrooms || 2} BHK</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-slate-50 rounded-lg items-center justify-center mr-3 border border-slate-100">
                <Move size={14} color="#64748b" />
            </View>
            <View>
                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Area</Text>
                <Text className="text-xs font-black text-slate-700 leading-none">{item.area || 1200} SQFT</Text>
            </View>
          </View>
        </View>

        <Button 
          label="Inquire Details" 
          variant="primary" 
          onPress={() => {}} 
          className="w-full"
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Premium Search Header */}
      <View className="px-6 pt-4 pb-6 bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center bg-slate-50 rounded-2xl px-5 py-4 border border-slate-200/50">
            <SearchIcon size={18} color="#94a3b8" />
            <TextInput 
              placeholder="Search projects, locations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 font-semibold text-slate-900 text-sm"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <TouchableOpacity className="w-14 h-14 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/30">
            <Filter size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
        ListHeaderComponent={
          properties.length > 0 ? (
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 pl-1">
                Showing {properties.length} Verified Projects
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-32 px-10">
            <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
                <SearchIcon size={32} color="#cbd5e1" strokeWidth={1} />
            </View>
            <Text className="text-slate-900 font-black text-lg text-center tracking-tight leading-tight">No properties match your search</Text>
            <Text className="text-slate-400 font-semibold text-sm text-center mt-2 leading-relaxed">Try adjusting your filters or searching for a different area.</Text>
            <TouchableOpacity className="mt-8">
                <Text className="text-primary font-black text-xs uppercase tracking-widest">Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
