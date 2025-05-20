import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import axiosInstance from '@/api/axios';
import { getSecureStore } from '@/utils/secureStore';
import { useIsFocused } from '@react-navigation/native';

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
  { id: 6, title: '아침형 인간', description: '아침 8시 전에 할 일을 완료했어요', isUnlocked: false, icon: '🌞' },
];

// 임시 업적 데이터
const ACHIEVEMENTS = [
  { id: 1, title: '할 일 마스터', progress: 75, maxProgress: 100, reward: 50, icon: '📝' },
  { id: 2, title: '꾸준함의 대가', progress: 5, maxProgress: 30, reward: 100, icon: '📅' },
  { id: 3, title: '빠른 완료', progress: 12, maxProgress: 20, reward: 30, icon: '⚡' },
];

type AchievementProps = {
  achievement_id: number | null;
  title: string | null;
  description: string | null;
  achieved_at: Date | null;
  icon: null;
};

export default function Award() {
  const colorScheme = useColorScheme();
  // const colors = Colors[colorScheme ?? 'light'];
  const colors = Colors['light'];

  // 임시 사용자 경험치 데이터
  const userExp = 350;
  const levelExp = 500;
  const currentLevel = 3;

  const expPercentage = useMemo(() => (userExp / levelExp) * 100, [userExp, levelExp]);

  const unlockedBadges = useMemo(() => BADGES.filter((badge) => badge.isUnlocked), []);
  const lockedBadges = useMemo(() => BADGES.filter((badge) => !badge.isUnlocked), []);
  const isFocused = useIsFocused();

  const [achievements, setAchievements] = useState<AchievementProps[]>([]);

  useEffect(() => {
    if (!isFocused) return;
    const fetchData = async () => {
      const accessToken = await getSecureStore('accessToken');
      const {
        data: { data },
      } = await axiosInstance.get('/achievements/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // console.log(data);
      setAchievements(data);
      return data;
    };
    fetchData();
  }, [isFocused]);

  console.log(achievements);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container}>
        {/* 획득한 업적 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>획득한 업적</Text>
          <View style={styles.badgeGrid}>
            {achievements.map((item: AchievementProps) => (
              <TouchableOpacity key={item.achievement_id} style={styles.badgeItem}>
                <View style={[styles.badgeIcon, { backgroundColor: colors.tint + '20' }]}>
                  <Text style={styles.badgeEmoji}>{item.icon}🍭</Text>
                </View>
                <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.badgeDesc, { color: colors.icon }]} numberOfLines={2}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 잠긴 업적 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>다가올 업적</Text>
          <View style={styles.badgeGrid}>
            {achievements.map((badge) => (
              <TouchableOpacity key={badge.achievement_id} style={styles.badgeItem}>
                <View style={[styles.badgeIcon, { backgroundColor: colors.icon + '20' }]}>
                  <Text style={[styles.badgeEmoji, { opacity: 0.5 }]}>{badge.icon}🍭</Text>
                </View>
                <Text style={[styles.badgeName, { color: colors.icon }]} numberOfLines={1}>
                  {badge.title}
                </Text>
                <Text style={[styles.badgeDesc, { color: colors.icon + '80' }]} numberOfLines={2}>
                  {badge.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 업적 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>업적</Text>
          {ACHIEVEMENTS.map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View style={styles.achievementHeader}>
                <View style={[styles.achievementIcon, { backgroundColor: colors.tint + '20' }]}>
                  <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
                  <View style={styles.achievementProgress}>
                    <View style={styles.achievementBarBg}>
                      <View
                        style={[
                          styles.achievementBarFill,
                          {
                            width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                            backgroundColor: colors.tint,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.achievementProgressText, { color: colors.text }]}>
                      {achievement.progress}/{achievement.maxProgress}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.achievementReward}>
                <Text style={[styles.achievementRewardText, { color: colors.tint }]}>+{achievement.reward} XP</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 하단 여백 */}
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
  levelSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  expContainer: {
    width: '100%',
    marginBottom: 16,
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
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: '30%',
    marginBottom: 16,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  achievementHeader: {
    flexDirection: 'row',
    flex: 1,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementBarBg: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    flex: 1,
    marginRight: 8,
  },
  achievementBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  achievementProgressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  achievementReward: {
    marginLeft: 12,
  },
  achievementRewardText: {
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
});
