import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors, QuestineColors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/api/axios';
import { useIsFocused } from '@react-navigation/native';
import CustomInput from '@/components/CustomInput';
import { UserInfo } from '@/types/user';

// 임시 통계 데이터
const STATISTICS = {
  weeklyAvgCompletion: 85, // 주간 평균 완료율(%)
  mostProductiveDay: '월요일',
  mostProductiveTime: '오전 9시',
  longestStreak: 5, // 최장 연속 완료일
  totalCompletedTasks: 15,
};

export default function Profile() {
  const colors = Colors['light'];
  const isFocused = useIsFocused();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (!isFocused) return;
    const fetchData = async () => {
      const { data } = await axiosInstance.get('/auth/me');
      setUserInfo(data);
      setNicknameInput(data.nickname); // 닉네임 입력값 초기화
      return data;
    };
    fetchData();
  }, [isFocused]);

  const router = useRouter();

  // 닉네임 변경
  const handleSubmitNickname = async () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      setNicknameError('닉네임을 입력해주세요.');
      return;
    }
    if (trimmed === userInfo?.nickname) {
      setNicknameError('기존 닉네임과 동일합니다.');
      return;
    }
    try {
      const { data } = await axiosInstance.patch('/auth/me', {
        nickname: trimmed,
      });
      setUserInfo((prev) => ({
        ...prev!,
        nickname: data.nickname,
      }));
      setIsEditingNickname(false);
      setNicknameError('');
      setIsModalVisible(false);
    } catch (e) {
      setNicknameError('닉네임 변경에 실패했습니다.');
    }
  };

  // 가입 기간 계산
  const calculateMembershipDuration = () => {
    const joinDate = new Date(userInfo?.created_at || '');
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 설정 페이지로 이동
  const navigateToSettings = () => {
    router.push('/settings');
  };

  // 닉네임 변경 모달 열기
  const openNicknameModal = () => {
    setIsModalVisible(true);
    setIsEditingNickname(true);
  };
  // 닉네임 변경 모달 닫기
  const closeNicknameModal = () => {
    setIsModalVisible(false);
    setIsEditingNickname(false);
    setNicknameInput(userInfo?.nickname || '');
    setNicknameError('');
  };

  const membershipDays = calculateMembershipDuration();
  return (
    <SafeAreaView style={[{ paddingTop: Platform.OS === 'android' ? 50 : 0 }, styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 헤더 섹션 */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userInfo?.nickname.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
              {userInfo?.nickname}
            </Text>
            <View style={styles.profileInfoRow}>
              <Text style={[styles.membershipText, { color: colors.icon }]}>{membershipDays}일째 사용 중</Text>
              <TouchableOpacity style={styles.changeNicknameBtn} onPress={openNicknameModal}>
                <Text style={styles.changeNicknameBtnText}>닉네임 변경하기</Text>
              </TouchableOpacity>
            </View>
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
              <Text style={[styles.statValue, { color: colors.text }]}>{userInfo?.statistics.totalCompletedTasks}</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>완료한 할 일</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{userInfo?.current_streak}</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>현재 연속일</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{userInfo?.longest_streak}</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>최장 연속일</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{userInfo?.longest_streak}</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>획득한 업적</Text>
            </View>

            {/* <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{STATISTICS.weeklyAvgCompletion}%</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>주간 완료율</Text>
            </View> */}
          </View>
          {/* <View style={styles.additionalStats}>
            <View style={styles.statRow}>
              <Text style={[styles.statRowLabel, { color: colors.icon }]}>가장 생산적인 요일:</Text>
              <Text style={[styles.statRowValue, { color: colors.text }]}>{STATISTICS.mostProductiveDay}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statRowLabel, { color: colors.icon }]}>가장 생산적인 시간:</Text>
              <Text style={[styles.statRowValue, { color: colors.text }]}>{STATISTICS.mostProductiveTime}</Text>
            </View>
          </View> */}
        </View>
      </ScrollView>
      {/* 닉네임 변경 모달 */}
      <Modal visible={isModalVisible} animationType='fade' transparent onRequestClose={closeNicknameModal}>
        <Pressable style={styles.modalOverlay} onPress={closeNicknameModal}>
          <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>닉네임 변경</Text>
            <CustomInput
              label='새 닉네임'
              value={nicknameInput}
              onChangeText={(text) => {
                setNicknameInput(text);
                setNicknameError('');
              }}
              style={styles.nicknameInput}
              placeholder='닉네임을 입력하세요'
              error={nicknameError}
              autoFocus
              maxLength={20}
            />
            <View style={styles.nicknameEditBtnRow}>
              <TouchableOpacity
                onPress={handleSubmitNickname}
                style={[styles.changeNicknameBtn, styles.confirmBtn, { flex: 1 }]}
              >
                <Text style={[styles.changeNicknameBtnText, styles.confirmBtnText]}>확인</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeNicknameModal}
                style={[styles.changeNicknameBtn, styles.cancelBtn, { flex: 1 }]}
              >
                <Text style={[styles.changeNicknameBtnText, styles.cancelBtnText]}>취소</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    backgroundColor: QuestineColors.ROSE_400,
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
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  changeNicknameBtn: {
    backgroundColor: QuestineColors.GRAY_200,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  changeNicknameBtnText: {
    fontSize: 12,
    color: QuestineColors.ROSE_400,
    fontWeight: 'bold',
  },
  nicknameEditContainer: {
    flex: 1,
    marginLeft: 8,
    minWidth: 180,
  },
  nicknameInput: {
    height: 36,
    fontSize: 14,
    marginBottom: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  nicknameEditBtnRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
  },
  confirmBtn: {
    backgroundColor: QuestineColors.ROSE_400,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
  },
  confirmBtnText: {
    color: QuestineColors.WHITE,
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
    marginLeft: 8,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: QuestineColors.PINK_400,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: QuestineColors.WHITE,
    borderRadius: 16,
    padding: 24,
    shadowColor: QuestineColors.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#222',
  },
});
