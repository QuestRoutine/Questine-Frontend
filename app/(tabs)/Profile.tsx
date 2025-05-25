import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSecureStore } from '@/utils/secureStore';
import axiosInstance from '@/api/axios';
import { useIsFocused } from '@react-navigation/native';

// 임시 뱃지 데이터
const BADGES = [
  { id: 1, title: '첫 투두 완료', description: '첫 번째 할 일을 완료했어요', isUnlocked: true, icon: '🏆' },
  {
    id: 2,
    title: '연속 3일 달성',
    description: '연속으로 3일 동안 모든 할 일을 완료했어요',
    isUnlocked: true,
    icon: '🔥',
  },
  {
    id: 3,
    title: '타임 마스터',
    description: '정해진 시간 내에 10개의 할 일을 완료했어요',
    isUnlocked: false,
    icon: '⏰',
  },
  { id: 4, title: '집중력 대장', description: '2시간 동안 할 일에 집중했어요', isUnlocked: true, icon: '🧠' },
  { id: 5, title: '초고수', description: '100개의 할 일을 완료했어요', isUnlocked: false, icon: '⭐' },
];

// 임시 통계 데이터
const STATISTICS = {
  weeklyAvgCompletion: 85, // 주간 평균 완료율(%)
  mostProductiveDay: '월요일',
  mostProductiveTime: '오전 9시',
  longestStreak: 5, // 최장 연속 완료일
  totalCompletedTasks: 15,
};

type UserInfo = {
  user_id: string;
  email: string;
  login_type: string;
  created_at: Date;
  updated_at: Date;
  nickname: string;
  exp: number;
  gold: number;
  level: number;
};

export default function Profile() {
  const colorScheme = useColorScheme();
  const colors = Colors['light'];
  const isFocused = useIsFocused();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    user_id: 'user_id',
    email: 'email',
    login_type: 'login_type',
    created_at: new Date(),
    updated_at: new Date(),
    nickname: 'nickname',
    exp: 0,
    gold: 0,
    level: 1,
  });

  useEffect(() => {
    if (!isFocused) return;
    const fetchData = async () => {
      const accessToken = await getSecureStore('accessToken');
      const { data } = await axiosInstance.get('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
      console.log(data);
      setUserInfo(data);
      return data;
    };
    fetchData();
  }, [isFocused]);

  const router = useRouter();

  // 레벨업에 필요한 경험치 계산
  const calculateRequiredExp = (currentLevel: number) => {
    const expPerLevel = 1000;
    const newLevel = Math.floor(userInfo.exp / expPerLevel) + 1;
    return newLevel;
  };

  const requiredExp = calculateRequiredExp(userInfo.level);
  const expPercentage = useMemo(() => (userInfo.exp / requiredExp) * 100, [userInfo.exp, requiredExp]);

  const unlockedBadges = useMemo(() => BADGES.filter((badge) => badge.isUnlocked), []);
  const lockedBadges = useMemo(() => BADGES.filter((badge) => !badge.isUnlocked), []);

  // 가입 기간 계산
  const calculateMembershipDuration = () => {
    const joinDate = new Date(userInfo.created_at);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 설정 페이지로 이동
  const navigateToSettings = () => {
    router.push('/settings');
  };

  const membershipDays = calculateMembershipDuration();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 헤더 섹션 */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userInfo.nickname.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
              {userInfo.nickname}
            </Text>
            <Text style={[styles.membershipText, { color: colors.icon }]}>{membershipDays}일째 사용 중</Text>
          </View>

          {/* 설정 버튼 */}
          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={navigateToSettings}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name='settings-outline' size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* 통계 정보 섹션 */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>나의 투두 통계</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{STATISTICS.totalCompletedTasks}</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>완료한 할 일</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{0}</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>현재 연속일</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{STATISTICS.longestStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>최장 연속일</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{STATISTICS.weeklyAvgCompletion}%</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>주간 완료율</Text>
            </View>
          </View>
          <View style={styles.additionalStats}>
            <View style={styles.statRow}>
              <Text style={[styles.statRowLabel, { color: colors.icon }]}>가장 생산적인 요일:</Text>
              <Text style={[styles.statRowValue, { color: colors.text }]}>{STATISTICS.mostProductiveDay}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statRowLabel, { color: colors.icon }]}>가장 생산적인 시간:</Text>
              <Text style={[styles.statRowValue, { color: colors.text }]}>{STATISTICS.mostProductiveTime}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF8DA1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  membershipText: {
    fontSize: 14,
  },
  settingsIcon: {
    marginLeft: 'auto',
    padding: 5,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  additionalStats: {
    paddingTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statRowLabel: {
    fontSize: 14,
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeItem: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeName: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    width: '100%',
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
});
