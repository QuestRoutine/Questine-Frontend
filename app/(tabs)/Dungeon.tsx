import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

// 던전 데이터 타입 정의
interface Dungeon {
  id: string;
  name: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  minLevel: number;
  image: any;
  description: string;
  rewards: {
    exp: number;
    gold: number;
    items?: string[];
  };
  enemies: string[];
  completed: boolean;
  unlocked: boolean;
}

// Mock 던전 데이터
const DUNGEONS: Dungeon[] = [
  {
    id: '1',
    name: '고블린 동굴',
    difficulty: 'easy',
    minLevel: 1,
    image: require('@/assets/images/icon.png'),
    description: '고블린들이 점령한 동굴입니다. 초보 모험가에게 적합합니다.',
    rewards: {
      exp: 100,
      gold: 200,
      items: ['기본 검', '체력 물약'],
    },
    enemies: ['고블린', '고블린 전사'],
    completed: false,
    unlocked: true,
  },
  {
    id: '2',
    name: '유령 숲',
    difficulty: 'normal',
    minLevel: 3,
    image: require('@/assets/images/icon.png'),
    description: '미스터리한 유령들이 출몰하는 숲. 주의가 필요합니다.',
    rewards: {
      exp: 250,
      gold: 350,
      items: ['유령 망토', '마력 물약'],
    },
    enemies: ['유령', '숲의 정령', '타락한 요정'],
    completed: false,
    unlocked: true,
  },
  {
    id: '3',
    name: '드래곤 둥지',
    difficulty: 'hard',
    minLevel: 8,
    image: require('@/assets/images/icon.png'),
    description: '무시무시한 드래곤이 지키고 있는 둥지. 높은 레벨의 용사만 도전하세요.',
    rewards: {
      exp: 800,
      gold: 1200,
      items: ['용의 비늘', '전설의 검'],
    },
    enemies: ['드래곤', '드래곤 하수인'],
    completed: false,
    unlocked: false,
  },
  {
    id: '4',
    name: '고대 사원',
    difficulty: 'expert',
    minLevel: 12,
    image: require('@/assets/images/icon.png'),
    description: '수천년 전부터 봉인된 강력한 적들이 잠들어 있는 사원입니다.',
    rewards: {
      exp: 1500,
      gold: 2000,
      items: ['고대 유물', '신화의 갑옷'],
    },
    enemies: ['고대 골렘', '사원 수호자', '불멸의 마법사'],
    completed: false,
    unlocked: false,
  },
];

// 현재 사용자 레벨 (Mock)
const USER_LEVEL = 5;

export default function DungeonScreen() {
  const colors = Colors['light'];
  const backgroundColor = colors.background;
  const textColor = colors.text;
  const accentColor = colors.tint;
  const cardBgColor = '#fff';

  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'all'>('available');

  // 던전 난이도에 따른 색상 반환
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'normal':
        return '#2196F3';
      case 'hard':
        return '#FFA000';
      case 'expert':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  // 한국어 난이도 표시
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '쉬움';
      case 'normal':
        return '보통';
      case 'hard':
        return '어려움';
      case 'expert':
        return '전문가';
      default:
        return '';
    }
  };

  // 던전 입장 처리
  const enterDungeon = (dungeon: Dungeon) => {
    if (USER_LEVEL < dungeon.minLevel) {
      alert(`레벨 ${dungeon.minLevel}부터 입장 가능한 던전입니다!`);
      return;
    }
    alert(`${dungeon.name}에 입장합니다!`);
    // 여기에 던전 입장 로직 추가
  };

  // 필터링된 던전 목록
  const filteredDungeons =
    activeTab === 'available'
      ? DUNGEONS.filter((dungeon) => USER_LEVEL >= dungeon.minLevel || dungeon.unlocked)
      : DUNGEONS;

  // 던전 카드 렌더링
  const renderDungeonCard = ({ item }: { item: Dungeon }) => {
    const isUnlocked = USER_LEVEL >= item.minLevel || item.unlocked;

    return (
      <TouchableOpacity
        style={[styles.dungeonCard, { backgroundColor: cardBgColor }, !isUnlocked && styles.lockedDungeon]}
        onPress={() => (isUnlocked ? setSelectedDungeon(item) : null)}
        activeOpacity={isUnlocked ? 0.7 : 1}
      >
        <View style={styles.dungeonHeader}>
          <Image source={item.image} style={styles.dungeonImage} />
          <View style={styles.dungeonTitleContainer}>
            <Text style={[styles.dungeonName, { color: textColor }]}>{item.name}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.difficultyText}>{getDifficultyText(item.difficulty)}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.dungeonDescription, { color: textColor }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.dungeonInfo}>
          <View style={styles.rewardSection}>
            <Text style={[styles.infoLabel, { color: textColor }]}>보상:</Text>
            <Text style={styles.rewardText}>💰 {item.rewards.gold} 골드</Text>
            <Text style={styles.rewardText}>✨ {item.rewards.exp} 경험치</Text>
          </View>

          <View style={styles.levelRequirement}>
            {!isUnlocked ? (
              <Text style={styles.lockedText}>🔒 레벨 {item.minLevel} 필요</Text>
            ) : (
              <TouchableOpacity
                style={[styles.enterButton, { backgroundColor: accentColor }]}
                onPress={() => enterDungeon(item)}
              >
                <Text style={styles.enterButtonText}>입장하기</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 던전 상세 정보 모달
  const renderDungeonDetail = () => {
    if (!selectedDungeon) return null;

    return (
      <View style={styles.detailModalOverlay}>
        <View style={[styles.detailModal, { backgroundColor: cardBgColor }]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedDungeon(null)}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Image source={selectedDungeon.image} style={styles.detailImage} />

          <Text style={[styles.detailName, { color: textColor }]}>{selectedDungeon.name}</Text>

          <View style={[styles.detailDifficulty, { backgroundColor: getDifficultyColor(selectedDungeon.difficulty) }]}>
            <Text style={styles.detailDifficultyText}>{getDifficultyText(selectedDungeon.difficulty)}</Text>
          </View>

          <Text style={[styles.detailDescription, { color: textColor }]}>{selectedDungeon.description}</Text>

          <View style={styles.detailSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>적 정보</Text>
            <View style={styles.enemiesList}>
              {selectedDungeon.enemies.map((enemy, index) => (
                <View key={index} style={styles.enemyBadge}>
                  <Text style={styles.enemyText}>👾 {enemy}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>보상</Text>
            <View style={styles.rewardsList}>
              <Text style={styles.rewardDetailText}>✨ {selectedDungeon.rewards.exp} 경험치</Text>
              <Text style={styles.rewardDetailText}>💰 {selectedDungeon.rewards.gold} 골드</Text>
              {selectedDungeon.rewards.items &&
                selectedDungeon.rewards.items.map((item, index) => (
                  <Text key={index} style={styles.rewardDetailText}>
                    🎁 {item}
                  </Text>
                ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.enterDetailButton, { backgroundColor: accentColor }]}
            onPress={() => {
              setSelectedDungeon(null);
              enterDungeon(selectedDungeon);
            }}
          >
            <Text style={styles.enterDetailButtonText}>던전 입장</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='auto' />

      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>⚔️ 던전 ⚔️</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'available' ? '#fff' : textColor }]}>⭐ 입장 가능</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'all' ? '#fff' : textColor }]}>🔍 전체 보기</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredDungeons}
        renderItem={renderDungeonCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.dungeonList}
        showsVerticalScrollIndicator={false}
      />

      {selectedDungeon && renderDungeonDetail()}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B95',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dungeonList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dungeonCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockedDungeon: {
    opacity: 0.7,
  },
  dungeonHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dungeonImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  dungeonTitleContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  dungeonName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dungeonDescription: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  dungeonInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardSection: {
    flex: 1,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
  },
  rewardText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  levelRequirement: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedText: {
    color: '#F44336',
    fontWeight: '600',
    fontSize: 14,
  },
  enterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // 상세 모달 스타일
  detailModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 20,
  },
  detailModal: {
    width: width * 0.85,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  detailDifficulty: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  detailDifficultyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailDescription: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 22,
  },
  detailSection: {
    width: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  enemiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  enemyBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  enemyText: {
    fontSize: 14,
  },
  rewardsList: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 10,
  },
  rewardDetailText: {
    fontSize: 14,
    marginBottom: 6,
  },
  enterDetailButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  enterDetailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
