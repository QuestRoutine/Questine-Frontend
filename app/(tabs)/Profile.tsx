import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import React, { useMemo } from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 임시 사용자 데이터
const USER_DATA = {
  name: '홍길동',
  level: 3,
  exp: 350,
  totalExp: 650,
  completedTodos: 15,
  streak: 2,
  joinDate: '2025-01-15',
  avatarUrl: null, // 기본 아바타 사용
};

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

// 레벨업에 필요한 경험치 계산
const calculateRequiredExp = (currentLevel: number) => {
  return currentLevel * 150 + 200;
};

export default function Profile() {
  const colorScheme = useColorScheme();
  const colors = Colors['light'];
  const router = useRouter();

  const requiredExp = calculateRequiredExp(USER_DATA.level);
  const expPercentage = useMemo(() => (USER_DATA.exp / requiredExp) * 100, [USER_DATA.exp, requiredExp]);

  const unlockedBadges = useMemo(() => BADGES.filter((badge) => badge.isUnlocked), []);
  const lockedBadges = useMemo(() => BADGES.filter((badge) => !badge.isUnlocked), []);

  // 가입 기간 계산
  const calculateMembershipDuration = () => {
    const joinDate = new Date(USER_DATA.joinDate);
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
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
      <SafeAreaView style={styles.container}>
        {/* 프로필 헤더 섹션 */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{USER_DATA.name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{USER_DATA.name}</Text>
            <Text style={[styles.membershipText, { color: colors.icon }]}>{membershipDays}일째 사용 중</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={navigateToSettings}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name='settings-outline' size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* 레벨 및 경험치 섹션 */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>레벨 {USER_DATA.level}</Text>
          <View style={styles.expContainer}>
            <View style={styles.expBarBg}>
              <View style={[styles.expBarFill, { width: `${expPercentage}%`, backgroundColor: '#FF8DA1' }]} />
            </View>
            <Text style={[styles.expText, { color: colors.icon }]}>
              {USER_DATA.exp} / {requiredExp} XP
            </Text>
          </View>
          <Text style={[styles.nextLevelText, { color: colors.icon }]}>
            다음 레벨까지 {requiredExp - USER_DATA.exp} XP 남았습니다
          </Text>
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
              <Text style={[styles.statValue, { color: colors.text }]}>{USER_DATA.streak}</Text>
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

        {/* 뱃지 섹션 */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>획득한 뱃지</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllButton, { color: '#FF8DA1' }]}>모두 보기</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgeGrid}>
            {unlockedBadges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <View style={[styles.badgeIcon, { backgroundColor: '#FF8DA1' + '20' }]}>
                  <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                </View>
                <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={1}>
                  {badge.title}
                </Text>
              </View>
            ))}
            {unlockedBadges.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.icon }]}>아직 획득한 뱃지가 없습니다</Text>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />

          <View style={styles.sectionHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>도전 가능한 뱃지</Text>
          </View>
          <View style={styles.badgeGrid}>
            {lockedBadges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <View style={[styles.badgeIcon, { backgroundColor: colors.icon + '20' }]}>
                  <Text style={[styles.badgeEmoji, { opacity: 0.5 }]}>{badge.icon}</Text>
                </View>
                <Text style={[styles.badgeName, { color: colors.icon }]} numberOfLines={1}>
                  {badge.title}
                </Text>
              </View>
            ))}
            {lockedBadges.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.icon }]}>모든 뱃지를 획득했습니다!</Text>
            )}
          </View>
        </View>

        {/* 설정 버튼 */}
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: colors.background }]}
          onPress={navigateToSettings}
        >
          <Text style={[styles.settingsButtonText, { color: colors.text }]}>설정</Text>
        </TouchableOpacity>

        {/* 하단 여백을 위한 빈 공간 */}
        <View style={styles.bottomPadding} />
      </SafeAreaView>
    </ScrollView>
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
    fontSize: 24,
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
  expContainer: {
    width: '100%',
    marginBottom: 8,
  },
  expBarBg: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  expBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  expText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  nextLevelText: {
    fontSize: 14,
    textAlign: 'center',
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
  settingsButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  settingsButtonText: {
    fontWeight: '500',
  },
  bottomPadding: {
    height: 30,
  },
});
