import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/api/axios';
import { useIsFocused } from '@react-navigation/native';

// 임시 통계 데이터
const STATISTICS = {
  weeklyAvgCompletion: 85, // 주간 평균 완료율(%)
  mostProductiveDay: '월요일',
  mostProductiveTime: '오전 9시',
  longestStreak: 5, // 최장 연속 완료일
  totalCompletedTasks: 15,
};

type UserInfo = {
  profile_id: number;
  user_id: number;
  nickname: string;
  avatar_url: string | null;
  join_date: string;
  total_completed_tasks: number;
  current_streak: number;
  longest_streak: number;
  weekly_avg_completion: number;
  most_productive_day: string | null;
  most_productive_time: string | null;
  created_at: string;
  updated_at: string;
  statistics: {
    totalCompletedTasks: number;
    current_streak: number;
    longest_streak: number;
    weekly_avg_completion: number;
    most_productive_day: string | null;
    most_productive_time: string | null;
  };
};

export default function Profile() {
  const colors = Colors['light'];
  const isFocused = useIsFocused();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (!isFocused) return;
    const fetchData = async () => {
      const { data } = await axiosInstance.get('/auth/me');
      setUserInfo(data);
      console.log(data.statistics.totalCompletedTasks);

      return data;
    };
    fetchData();
  }, [isFocused]);

  const router = useRouter();

  // 닉네임 변경 버튼 클릭 핸들러
  const handleChangeNickname = () => {
    alert('닉네임 변경 기능은 준비 중입니다.');
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

  const membershipDays = calculateMembershipDuration();
  return (
    <SafeAreaView style={styles.container}>
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
              <TouchableOpacity style={styles.changeNicknameBtn} onPress={handleChangeNickname}>
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
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  changeNicknameBtn: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  changeNicknameBtnText: {
    fontSize: 12,
    color: '#FF8DA1',
    fontWeight: 'bold',
  },
});
