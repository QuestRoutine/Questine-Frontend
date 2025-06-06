import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import useAuth from '@/hooks/useAuth';

// 설정 메뉴 아이템 타입 정의
type SettingItem = {
  id: string;
  title: string;
  icon: string;
  route?: string;
  action?: () => void;
};

export default function Settings() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors['light'];

  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // 설정 메뉴 아이템
  const settingItems: SettingItem[] = [
    {
      id: 'account',
      title: '계정 설정',
      icon: 'person-outline',
      route: '/settings/account',
    },
    {
      id: 'logout',
      title: '로그아웃',
      icon: 'log-out-outline',
      action: handleLogout,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {settingItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.menuItem, { borderBottomColor: colors.icon + '20' }]}
          onPress={() => {
            if (item.route) {
              router.push(item.route as any);
            } else if (item.action) {
              item.action();
            }
          }}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.icon + '10' }]}>
              <Ionicons name={item.icon as any} size={22} color={colors.text} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
          </View>
          <Ionicons name='chevron-forward' size={20} color={colors.icon} />
        </TouchableOpacity>
      ))}

      {/* 앱 정보 */}
      <View style={styles.appInfo}>
        <Text style={[styles.appVersion, { color: colors.icon }]}>Questine v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  appInfo: {
    marginTop: 40,
    alignItems: 'center',
    paddingBottom: 40,
  },
  appVersion: {
    fontSize: 14,
  },
});
