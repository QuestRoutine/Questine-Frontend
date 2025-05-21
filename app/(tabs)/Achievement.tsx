import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, QuestineColors } from '@/constants/Colors';
import axiosInstance from '@/api/axios';
import { getSecureStore } from '@/utils/secureStore';
import { useIsFocused } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { X } from 'lucide-react-native';

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

  // 모달 상태 및 선택된 업적 추가
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementProps | null>(null);

  // 업적 클릭 핸들러
  const handleAchievementPress = (achievement: AchievementProps) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container}>
        <Modal
          isVisible={modalVisible}
          style={styles.modal}
          backdropOpacity={0.7}
          onBackdropPress={closeModal}
          onSwipeComplete={closeModal}
          swipeDirection={['down', 'right']}
          propagateSwipe={true}
          animationIn='slideInUp'
          animationOut='slideOutDown'
          swipeThreshold={100}
        >
          <View style={[styles.modalContent, { backgroundColor: QuestineColors.WHITE }]}>
            <View style={styles.dragIndicator} />
            <TouchableOpacity style={styles.backButton} onPress={closeModal}>
              <X size={28} />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.fullScreenContent}>
              {selectedAchievement && (
                <View style={styles.achievementDetail}>
                  {/* 업적 아이콘 */}
                  <View style={styles.detailBadgeIconWrapper}>
                    <View style={[styles.detailBadgeIcon]}>
                      <Text style={styles.detailBadgeEmoji}>{selectedAchievement.icon || '🍭'}</Text>
                    </View>
                  </View>

                  {/* 업적 제목 */}
                  <View style={styles.titleContainer}>
                    <Text style={styles.detailTitle}>{selectedAchievement.title}</Text>
                  </View>

                  {/* 업적 설명 */}
                  <View style={styles.achievementDescription}>
                    <Text style={styles.detailDescription}>{selectedAchievement.description}</Text>
                  </View>

                  {/* 달성 일자 박스 */}
                  {selectedAchievement.achieved_at && (
                    <View style={styles.achievedContainer}>
                      <Text style={[styles.achievedLabel]}>달성 일자</Text>
                      <Text style={[styles.achievedDate]}>
                        {selectedAchievement.achieved_at.toString().slice(0, 10)}
                      </Text>
                      <View style={styles.achievedBadge}>
                        <Text style={styles.achievedBadgeText}>최종보상</Text>
                      </View>
                      <View style={styles.rewardSection}>
                        <Image
                          source={require('@/assets/potion.png')}
                          style={{
                            width: 64,
                            height: 64,
                            backgroundColor: QuestineColors.SKY_100,
                            borderRadius: 4,
                            borderWidth: 3,
                          }}
                          resizeMode='contain'
                        />
                        <Image
                          source={require('@/assets/potion2.png')}
                          style={{
                            width: 64,
                            height: 64,
                            backgroundColor: QuestineColors.SKY_100,
                            borderRadius: 4,
                            borderWidth: 3,
                          }}
                          resizeMode='contain'
                        />
                      </View>
                      <Text style={styles.rewardValue}>+100 XP</Text>
                    </View>
                  )}

                  {/* 미달성 업적인 경우 */}
                  {!selectedAchievement.achieved_at && (
                    <View style={styles.lockedContainer}>
                      <Text style={styles.lockedTitle}>미달성 업적</Text>
                      <Text style={styles.lockedDescription}>
                        이 업적을 달성하면 경험치와 특별한 보상을 획득할 수 있습니다.
                      </Text>
                      <View style={styles.lockedReward}>
                        <Text style={styles.lockedRewardLabel}>달성 시 보상</Text>
                        <Text style={styles.lockedRewardValue}>+50 XP</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* 획득한 업적 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>획득한 업적</Text>
          <View style={styles.badgeGrid}>
            {achievements.map((item: AchievementProps) => (
              <TouchableOpacity
                key={item.achievement_id}
                style={styles.badgeItem}
                onPress={() => handleAchievementPress(item)}
              >
                <View style={[styles.badgeIcon, { backgroundColor: colors.tint + '20' }]}>
                  <Text style={styles.badgeEmoji}>{item.icon || '🍭'}</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>미달성 업적</Text>
          <View style={styles.badgeGrid}>
            {achievements.map((badge) => (
              <TouchableOpacity key={badge.achievement_id} style={styles.badgeItem}>
                <View style={[styles.badgeIcon, { backgroundColor: colors.icon + '20' }]}>
                  <Text style={[styles.badgeEmoji, { opacity: 0.5 }]}>{badge.icon || '🍭'}</Text>
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
        {/* 진척도 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>진척도</Text>
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
  modal: {
    margin: 0,
    padding: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 20,
    height: '95%',
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: QuestineColors.GRAY_500 + '50',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 5,
  },
  modalHeader: {
    width: 50,
  },

  // 업적 상세
  fullScreenContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  achievementDetail: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },

  // 업적 아이콘 래퍼
  detailBadgeIconWrapper: {
    position: 'relative',
    marginBottom: 24,
    zIndex: 1,
  },

  // 업적 아이콘 스타일 업데이트
  detailBadgeIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: QuestineColors.AMBER_500,
    shadowOpacity: 1,
    shadowRadius: 35,
  },

  detailBadgeEmoji: {
    fontSize: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },

  // 제목 프레임
  titleContainer: {
    padding: 12,
    marginBottom: 24,
    minWidth: '80%',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // 업적 상세 설명
  achievementDescription: {
    width: '90%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
  },

  detailDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: QuestineColors.GRAY_500,
  },

  // 달성 컨테이너
  achievedContainer: {
    alignItems: 'center',
    padding: 20,
  },

  // 달성 뱃지
  achievedBadge: {
    backgroundColor: QuestineColors.BLUE_300,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 15,
  },

  achievedBadgeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },

  achievedLabel: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
  },

  achievedDate: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },

  // 보상 섹션
  rewardSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  rewardValue: {
    fontSize: 18,
    marginTop: 15,
    fontWeight: 'bold',
    color: QuestineColors.PINK_500,
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 999,
  },
  // 미달성 업적 스타일
  lockedContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 20,
    width: '90%',
    borderRadius: 15,
    borderWidth: 1,
  },

  lockedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  lockedDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },

  lockedReward: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  lockedRewardLabel: {
    fontSize: 14,
  },

  lockedRewardValue: {
    fontSize: 16,
    fontWeight: '600',
  },
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
