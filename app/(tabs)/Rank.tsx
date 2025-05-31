import axiosInstance from '@/api/axios';
import { getMe } from '@/api/auth';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Image, Platform } from 'react-native';

interface RankingUser {
  userId: number;
  nickname: string;
  level: number;
  exp: number;
  avatar?: any;
}

const MOCK_RANKING: RankingUser[] = [
  {
    userId: 1,
    nickname: '마법사짱',
    level: 12,
    exp: 3200,
    avatar: require('@/assets/images/characters/class1.png'),
  },
  {
    userId: 2,
    nickname: '용감한기사',
    level: 10,
    exp: 2500,
    avatar: require('@/assets/images/characters/class1.png'),
  },
  {
    userId: 3,
    nickname: '치유의요정',
    level: 8,
    exp: 1800,
    avatar: require('@/assets/images/characters/class1.png'),
  },
  {
    userId: 4,
    nickname: '초보모험가',
    level: 5,
    exp: 900,
    avatar: require('@/assets/images/characters/class1.png'),
  },
  {
    userId: 5,
    nickname: '초보모험가',
    level: 5,
    exp: 900,
    avatar: require('@/assets/images/characters/class1.png'),
  },
  {
    userId: 6,
    nickname: '초보모험가',
    level: 5,
    exp: 900,
    avatar: require('@/assets/images/characters/class1.png'),
  },
  {
    userId: 7,
    nickname: '초보모험가',
    level: 5,
    exp: 900,
    avatar: require('@/assets/images/characters/class1.png'),
  },
  { userId: 8, nickname: '나', level: 3, exp: 700, avatar: require('@/assets/images/characters/class1.png') },
];

const RANK_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'weekly', label: '주간' },
  { key: 'montly', label: '월간' },
  { key: 'yearly', label: '연간' },
  { key: 'friends', label: '친구' },
];

export default function Rank() {
  const [ranking, setRanking] = useState<RankingUser[]>(MOCK_RANKING);
  const [filter, setFilter] = useState('all');
  const [myInfo, setMyInfo] = useState<RankingUser | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
    const fetchData = async () => {
      const me = await getMe();
      const myNickname = me.nickname;
      const { data } = await axiosInstance.get('/rank');
      const mapped = data.map((item: any) => ({
        userId: item.user_id,
        nickname: item.nickname,
        level: item.level,
        exp: item.total_exp,
        avatar: require('@/assets/images/characters/class1.png'),
      }));
      setRanking(mapped);
      const my = mapped.find((user: RankingUser) => user.nickname === myNickname);
      if (my) {
        setMyInfo(my);
        setMyRank(mapped.findIndex((user: RankingUser) => user.userId === my.userId) + 1);
      } else {
        setMyInfo(null);
        setMyRank(null);
      }
    };
    fetchData();
  }, [isFocused]);

  return (
    <ScrollView
      style={[{ paddingTop: Platform.OS === 'android' ? 50 : 0 }, styles.container]}
      contentContainerStyle={{ padding: 20 }}
    >
      <SafeAreaView>
        {/* 랭킹 필터 탭 */}
        <View style={styles.filterBar}>
          {RANK_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterButton, filter === f.key && styles.filterButtonActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterButtonText, filter === f.key && styles.filterButtonTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* 내 정보 카드 */}
        {myInfo && myRank && (
          <View style={styles.myInfoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={myInfo.avatar} style={styles.myAvatar} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.myInfoName} numberOfLines={2}>
                  {myInfo.nickname} (내 순위: {myRank}위)
                </Text>
                <Text style={styles.myInfoLevel}>
                  Lv.{myInfo.level} | {myInfo.exp} EXP
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.myInfoButton}
              onPress={() => {
                /* 내 정보로 이동 구현 필요 */
              }}
            >
              <Text style={styles.myInfoButtonText}>내 정보로 이동</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.title}>🏆 전체 캐릭터 랭킹</Text>
        <View style={styles.rankingBox}>
          {ranking.map((user, idx) => (
            <View
              key={user.userId}
              style={[styles.rankingRow, myInfo && user.userId === myInfo.userId && styles.myRankingRow]}
            >
              {/* 순위 및 상위 3위 뱃지 */}
              <View style={{ width: 40, alignItems: 'center' }}>
                {idx === 0 ? (
                  <Text style={styles.rankCrown}>🥇</Text>
                ) : idx === 1 ? (
                  <Text style={styles.rankCrown}>🥈</Text>
                ) : idx === 2 ? (
                  <Text style={styles.rankCrown}>🥉</Text>
                ) : (
                  <Text style={styles.rankNumber}>{idx + 1}</Text>
                )}
              </View>
              {/* 캐릭터 아바타 */}
              <Image source={user.avatar} style={styles.avatarCircle} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nickname} numberOfLines={1}>
                  {user.nickname}
                </Text>
                <Text style={styles.levelExp}>
                  Lv.{user.level} | {user.exp} EXP
                </Text>
              </View>
              {/* 내 정보 뱃지 */}
              {myInfo && user.userId === myInfo.userId && (
                <View style={styles.meBadge}>
                  <Text style={styles.meBadgeText}>ME</Text>
                </View>
              )}
            </View>
          ))}
        </View>
        <Text style={styles.rankNotice}>랭킹은 매일 자정(00시)에 업데이트 됩니다</Text>
      </SafeAreaView>
      {/* 하단 여백 */}
      <View style={{ height: 96 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rankNotice: {
    textAlign: 'center',
    color: '#888',
    fontSize: 13,
    marginBottom: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 18,
    color: '#667eea',
    alignSelf: 'center',
  },
  rankingBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#f1f3f5',
  },
  myRankingRow: {
    backgroundColor: '#ffe06633',
    borderRadius: 12,
    marginBottom: 4,
  },
  rankNumber: {
    width: 32,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#b19700',
    textAlign: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nickname: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  levelExp: {
    fontSize: 13,
    color: '#888',
  },
  meBadge: {
    backgroundColor: '#ffe066',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  meBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#b19700',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#f1f3f5',
    marginHorizontal: 2,
  },
  filterButtonActive: {
    backgroundColor: '#ffe066',
  },
  filterButtonText: {
    fontWeight: 'bold',
    color: '#888',
    fontSize: 15,
  },
  filterButtonTextActive: {
    color: '#b19700',
  },
  myInfoCard: {
    backgroundColor: '#fffbe6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#ffd43b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  myAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#f8fafc',
  },
  myInfoName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#b19700',
    marginBottom: 2,
  },
  myInfoLevel: {
    fontSize: 13,
    color: '#888',
  },
  myInfoButton: {
    backgroundColor: '#ffe066',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  myInfoButtonText: {
    fontWeight: 'bold',
    color: '#b19700',
    fontSize: 14,
  },
  rankCrown: {
    fontSize: 28,
    marginBottom: 2,
  },
});
