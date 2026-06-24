import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Search, User, LayoutDashboard, Compass } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: 65,
          paddingBottom: 12,
          paddingTop: 12,
          backgroundColor: theme.background,
        },
        headerStyle: {
          backgroundColor: theme.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTitleStyle: {
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: 2,
          fontSize: 12,
          color: theme.text,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color }) => <Compass size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
