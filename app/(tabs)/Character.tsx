import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, Platform } from 'react-native';
import { AchievementProps, LevelProps } from '@/types/user';
import { QuestineColors } from '@/constants/Colors';
import axiosInstance from '@/api/axios';
import { useIsFocused } from '@react-navigation/native';
import { getServerUrl } from '@/utils/env';

export default function CharacterScreen() {
  const isFocused = useIsFocused();
  const [characterInfo, setCharacterInfo] = useState<LevelProps | null>(null);
  const [achievements, setAchievements] = useState<AchievementProps[]>([]);
  const [userAvgLevel, setUserAvgLevel] = useState<number>(0);

  useEffect(() => {
    if (!isFocused) return;
    const fetchData = async () => {
      const {
        data: { data },
      } = await axiosInstance.get('/characters/me');
      setCharacterInfo(data);
    };
    const fetchAchievements = async () => {
      const {
        data: { data },
      } = await axiosInstance.get('/achievements');
      setAchievements(data);
    };
    const fetchUserAvgLevel = async () => {
      const { data } = await axiosInstance.get('/characters/avg');
      setUserAvgLevel(Math.trunc(data.avgLevel));
    };
    fetchData();
    fetchAchievements();
    fetchUserAvgLevel();
  }, [isFocused]);

  return (
    <SafeAreaView style={[{ paddingTop: Platform.OS === 'android' ? 50 : 0 }, styles.container]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>캐릭터</Text>
        </View>
        {/* 캐릭터 카드 영역 */}
        <View style={styles.msCharacterCard}>
          <View style={styles.msAvatarWrapper}>
            <View style={styles.msAvatarCircle}>
              <Image
                source={
                  characterInfo?.image_url
                    ? {
                        uri: `${getServerUrl()}${characterInfo.image_url}`,
                      }
                    : require('@/assets/images/characters/tree0.png')
                }
                style={styles.msAvatarImage}
                resizeMode='cover'
              />
            </View>
          </View>
          {/* 닉네임 */}
          <Text numberOfLines={1} style={styles.msNickname}>
            {characterInfo?.character_name ?? '모험가'}
          </Text>
          {/* 레벨 */}
          <View style={styles.msBadgesRow}>
            <View style={[styles.msBadge, { backgroundColor: QuestineColors.SKY_300 }]}>
              <Text style={styles.msBadgeText}>Lv.{characterInfo?.level ?? 1}</Text>
            </View>
          </View>
          {/* 경험치바 */}
          <View style={styles.msExpBarWrapper}>
            <View style={styles.msExpBarBg}>
              <View
                style={[
                  styles.msExpBarFill,
                  {
                    width: `${((characterInfo?.exp ?? 0) / (characterInfo?.nextLevelExp ?? 1)) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.msExpBarText}>
              {characterInfo?.exp} / {characterInfo?.nextLevelExp} EXP
            </Text>
          </View>
        </View>

        {/* 내가 획득한 업적 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10, color: '#667eea' }}>
            🏆 내가 획득한 업적
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {achievements.filter((item) => item.is_unlocked).length === 0 && (
              <Text style={{ color: '#aaa', fontSize: 14 }}>아직 획득한 업적이 없습니다.</Text>
            )}
            {achievements
              .filter((item) => item.is_unlocked)
              .map((item) => (
                <View key={item.achievement_id} style={{ alignItems: 'center' }}>
                  <View
                    style={{
                      backgroundColor: '#ffe066',
                      borderRadius: 30,
                      width: 54,
                      height: 54,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{item.icon ? item.icon : '🍭'}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#888', fontWeight: '600' }} numberOfLines={1}>
                    {item.title ?? '업적'}
                  </Text>
                </View>
              ))}
          </ScrollView>
        </View>

        {/* 용자와 랭킹 비교 */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10, color: '#667eea' }}>
            👥 사용자와 랭킹 비교
          </Text>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#f8fafc',
              borderRadius: 18,
              padding: 18,
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 18,
            }}
          >
            {/* 내 캐릭터 */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontWeight: 'bold', color: '#667eea', marginBottom: 6 }}>나</Text>
              <View style={{ backgroundColor: '#fffbe6', borderRadius: 16, padding: 8, marginBottom: 6 }}>
                <Text style={{ fontSize: 22 }}>🧙‍♂️</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#888' }}>Lv.{characterInfo?.level ?? 1}</Text>
            </View>
            {/* 구분선 */}
            <View style={{ width: 1, height: 70, backgroundColor: '#e9ecef', marginHorizontal: 8 }} />
            {/* 친구(또는 평균) */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontWeight: 'bold', color: '#888', marginBottom: 6 }}>이용자 평균</Text>
              <View style={{ backgroundColor: '#e9ecef', borderRadius: 16, padding: 8, marginBottom: 6 }}>
                <Text style={{ fontSize: 22 }}>🧑‍🤝‍🧑</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#888' }}>Lv.{userAvgLevel}</Text>
            </View>
          </View>
        </View>
        {/* 하단 여백 */}
        <View style={{ height: 96 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  msCharacterCard: {
    backgroundColor: QuestineColors.WHITE,
    borderRadius: 30,
    padding: 30,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFE066',
    shadowColor: '#FFE066',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  msAvatarWrapper: {
    marginBottom: 15,
  },
  msAvatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: '#ffd43b',
    backgroundColor: '#fffbe6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffd43b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  msAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  msNickname: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    margin: 'auto',
  },
  msBadgesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  msBadge: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: QuestineColors.SKY_300,
  },
  msBadgeText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    letterSpacing: 0.5,
  },
  msExpBarWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  msExpBarBg: {
    width: '95%',
    height: 16,
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: QuestineColors.AMBER_400,
    marginBottom: 6,
  },
  msExpBarFill: {
    height: '100%',
    backgroundColor: QuestineColors.AMBER_400,
    borderRadius: 8,
  },
  msExpBarText: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: '#fffbe6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
