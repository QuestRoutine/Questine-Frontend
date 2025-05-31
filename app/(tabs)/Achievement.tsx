import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Image, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { Colors, QuestineColors } from '@/constants/Colors';
import axiosInstance from '@/api/axios';
import { useIsFocused } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { X } from 'lucide-react-native';

type AchievementProps = {
  achievement_id: number | null;
  title: string | null;
  description: string | null;
  is_unlocked: boolean;
  unlocked_at: string | null;
  icon: null;
  unlocked_user_count: number;
};

export default function Award() {
  const colors = Colors['light'];
  const isFocused = useIsFocused();
  const [achievements, setAchievements] = useState<AchievementProps[]>([]);

  useEffect(() => {
    if (!isFocused) return;
    const fetchData = async () => {
      const {
        data: { data },
      } = await axiosInstance.get('/achievements');
      setAchievements(data);
      return data;
    };
    fetchData();
  }, [isFocused]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementProps | null>(null);

  // 업적 클릭
  const handleAchievementPress = (achievement: AchievementProps) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <ScrollView>
      <SafeAreaView style={[{ paddingTop: Platform.OS === 'android' ? 50 : 0 }, styles.container]}>
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

                  {/* 달성한 사용자 수 */}
                  <View style={styles.userCountContainer}>
                    <Text style={styles.userCountText}>
                      총 {selectedAchievement.unlocked_user_count}명이 달성한 업적
                    </Text>
                  </View>

                  {/* 달성 일자 박스 */}
                  {selectedAchievement.unlocked_at && (
                    <View style={styles.achievedContainer}>
                      <Text style={[styles.achievedLabel]}>달성 일자</Text>
                      <Text style={[styles.achievedDate]}>
                        {selectedAchievement.unlocked_at.toString().slice(0, 10)}
                      </Text>
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
            {achievements.some((item) => item.is_unlocked) ? (
              achievements.map(
                (item: AchievementProps) =>
                  item.is_unlocked && (
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
                  )
              )
            ) : (
              <Text style={{ color: colors.icon, textAlign: 'center', width: '100%', marginVertical: 16 }}>
                획득한 업적이 없습니다
              </Text>
            )}
          </View>
        </View>
        {/* 잠긴 업적 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>미달성 업적</Text>
          <View style={styles.badgeGrid}>
            {achievements.map(
              (item: AchievementProps) =>
                !item.is_unlocked && (
                  <TouchableOpacity key={item.achievement_id} style={styles.badgeItem}>
                    <View style={[styles.badgeIcon, { backgroundColor: colors.icon + '20' }]}>
                      <Text style={[styles.badgeEmoji, { opacity: 0.5 }]}>{item.icon || '🍭'}</Text>
                    </View>
                    <Text style={[styles.badgeName, { color: colors.icon }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={[styles.badgeDesc, { color: colors.icon }]} numberOfLines={2}>
                      🔒
                    </Text>
                  </TouchableOpacity>
                )
            )}
          </View>
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
  // 사용자 수 컨테이너
  userCountContainer: {
    backgroundColor: QuestineColors.SKY_100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 25,
    alignItems: 'center',
  },
  userCountText: {
    fontSize: 14,
    fontWeight: '500',
    color: QuestineColors.BLUE_500,
    textAlign: 'center',
  },
  // 달성 컨테이너
  achievedContainer: {
    alignItems: 'center',
    padding: 20,
  },
  // 달성 업적
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
  container: {
    marginHorizontal: 20,
    marginBottom: 100,
  },
  section: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
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
  bottomPadding: {
    height: 96,
  },
});
