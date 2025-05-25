import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  SafeAreaView,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StatusBar } from 'expo-status-bar';
import { UserCharacter, Item, EquippedItems, CharacterImageType } from '@/types/character';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_USER: UserCharacter = {
  level: 1,
  exp: 450,
  nextLevelExp: 1000,
  gold: 2500,
  stats: {
    health: 150,
    attack: 20,
    defense: 12,
  },
};

// 레벨별 캐릭터 이미지
const characterImages: Record<CharacterImageType, any> = {
  beginner: require('@/assets/images/characters/class1.png'), // 레벨 1-3
  intermediate: require('@/assets/images/characters/class1.png'), // 레벨 4-7
  advanced: require('@/assets/images/characters/class1.png'), // 레벨 8-10
  expert: require('@/assets/images/characters/class1.png'), // 레벨 11+
};

// 상점 아이템 Mock data
const SHOP_ITEMS: Item[] = [
  {
    id: '1',
    name: '기본 검',
    type: 'weapon',
    price: 300,
    requiredLevel: 1,
    image: require('@/assets/images/icon.png'),
    description: '기본적인 검입니다.',
    stats: { attack: 5 },
  },
  {
    id: '2',
    name: '강화된 검',
    type: 'weapon',
    price: 800,
    requiredLevel: 3,
    image: require('@/assets/images/icon.png'),
    description: '강화된 검입니다.',
    stats: { attack: 12 },
  },
  {
    id: '3',
    name: '가벼운 방패',
    type: 'shield',
    price: 500,
    requiredLevel: 2,
    image: require('@/assets/images/icon.png'),
    description: '가볍지만 튼튼한 방패입니다.',
    stats: { defense: 8 },
  },
  {
    id: '4',
    name: '체력 물약',
    type: 'consumable',
    price: 100,
    requiredLevel: 1,
    image: require('@/assets/images/icon.png'),
    description: '체력을 회복합니다.',
    effect: '체력 +50',
  },
  {
    id: '5',
    name: '전설의 갑옷',
    type: 'armor',
    price: 2000,
    requiredLevel: 8,
    image: require('@/assets/images/icon.png'),
    description: '전설적인 갑옷입니다.',
    stats: { defense: 30, health: 100 },
  },
];

// 현재 장착한 아이템
const INITIAL_EQUIPPED_ITEMS: EquippedItems = {
  weapon: null,
  shield: null,
  armor: null,
};

// 아이템 카테고리
const ITEM_CATEGORIES = [
  { id: 'all', name: '전체' },
  { id: 'weapon', name: '무기' },
  { id: 'armor', name: '갑옷' },
  { id: 'shield', name: '방패' },
  { id: 'consumable', name: '소비품' },
];

const colors = Colors['light'];

export default function CharacterScreen() {
  const textColor = colors.text;
  const cardBgColor = '#fff';
  const accentColor = colors.tint;

  const [activeTab, setActiveTab] = useState('character');
  const [equippedItems, setEquippedItems] = useState<EquippedItems>(INITIAL_EQUIPPED_ITEMS);
  const [inventory, setInventory] = useState<string[]>(['1', '3']);
  const [gold, setGold] = useState(MOCK_USER.gold);
  const [userStats, setUserStats] = useState(MOCK_USER.stats);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showItemDetails, setShowItemDetails] = useState<Item | null>(null);

  // 애니메이션 값들
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const tabSwitchAnim = useRef(new Animated.Value(0)).current;
  const goldAnim = useRef(new Animated.Value(1)).current;

  // 골드 변화 애니메이션
  const animateGoldChange = () => {
    Animated.sequence([
      Animated.timing(goldAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(goldAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 탭 전환 애니메이션
  const switchTab = (tab: string) => {
    setActiveTab(tab);
    Animated.spring(tabSwitchAnim, {
      toValue: tab === 'character' ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  // 레벨에 따라 캐릭터 이미지 결정
  const getCharacterImage = (): any => {
    const level = MOCK_USER.level;

    if (level >= 11) return characterImages.expert;
    if (level >= 8) return characterImages.advanced;
    if (level >= 4) return characterImages.intermediate;
    return characterImages.beginner;
  };

  // 아이템 구매
  const buyItem = (item: Item) => {
    if (gold >= item.price && MOCK_USER.level >= item.requiredLevel) {
      setGold(gold - item.price);
      setInventory([...inventory, item.id]);
      animateGoldChange();
      Alert.alert('🎉 구매 완료!', `${item.name}을(를) 구매했습니다!`, [{ text: '확인' }]);
    } else if (MOCK_USER.level < item.requiredLevel) {
      Alert.alert('⚠️ 레벨 부족', `이 아이템을 구매하려면 레벨 ${item.requiredLevel}이 필요합니다.`, [
        { text: '확인' },
      ]);
    } else {
      Alert.alert('💸 골드 부족', '골드가 부족합니다!', [{ text: '확인' }]);
    }
  };

  // 아이템 장착
  const equipItem = (item: Item) => {
    if (inventory.includes(item.id)) {
      // 이전에 장착된 같은 타입의 아이템 스탯 제거
      const previousItemId = equippedItems[item.type as keyof EquippedItems];
      if (previousItemId) {
        const previousItem = SHOP_ITEMS.find((i) => i.id === previousItemId);
        if (previousItem?.stats) {
          // 이전 아이템 스탯 제거
        }
      }

      setEquippedItems({
        ...equippedItems,
        [item.type]: item.id,
      });

      // 아이템 스탯 적용
      if (item.stats) {
        setUserStats((prevStats) => ({
          health: prevStats.health + (item.stats?.health || 0),
          attack: prevStats.attack + (item.stats?.attack || 0),
          defense: prevStats.defense + (item.stats?.defense || 0),
        }));
      }

      alert(`✨ ${item.name}을(를) 장착했습니다!`);
    }
  };

  // 레벨에 따른 상태 보너스 계산
  const calculateStats = () => {
    // 기본 스탯
    const baseStats = {
      health: 100 + MOCK_USER.level * 10,
      attack: 10 + MOCK_USER.level * 2,
      defense: 5 + Math.floor(MOCK_USER.level * 1.5),
    };

    // 장착된 아이템의 추가 스탯 계산
    let bonusStats = {
      health: 0,
      attack: 0,
      defense: 0,
    };

    Object.values(equippedItems).forEach((itemId) => {
      if (itemId) {
        const item = SHOP_ITEMS.find((i) => i.id === itemId);
        if (item && item.stats) {
          bonusStats.health += item.stats.health || 0;
          bonusStats.attack += item.stats.attack || 0;
          bonusStats.defense += item.stats.defense || 0;
        }
      }
    });

    return {
      health: baseStats.health + bonusStats.health,
      attack: baseStats.attack + bonusStats.attack,
      defense: baseStats.defense + bonusStats.defense,
    };
  };

  const stats = calculateStats();

  const renderShopItem = ({ item }: { item: Item }) => {
    const isOwned = inventory.includes(item.id);
    const isEquipped = equippedItems[item.type as keyof EquippedItems] === item.id;
    const canBuy = MOCK_USER.level >= item.requiredLevel;

    const animatePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.msShopItemCard, isEquipped && { borderColor: '#4CAF50', borderWidth: 3 }]}
          onLongPress={() => setShowItemDetails(item)}
          onPress={animatePress}
          activeOpacity={0.8}
        >
          <View style={styles.msShopItemLeft}>
            <View style={[styles.msShopItemImageCircle, isEquipped && { borderColor: '#4CAF50' }]}>
              <Image source={item.image} style={styles.msShopItemImage} />
              {isEquipped && (
                <View style={styles.equippedBadge}>
                  <Text style={styles.equippedBadgeText}>✓</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.msShopItemInfo}>
            <Text style={[styles.msShopItemName, isEquipped && { color: '#4CAF50' }]}>{item.name}</Text>
            <Text style={styles.msShopItemDesc}>{item.description}</Text>
            <View style={styles.msShopItemStatsRow}>
              {item.stats?.attack && (
                <View style={[styles.msShopStatBadge, { backgroundColor: '#FFE066' }]}>
                  <Text style={styles.statBadgeText}>⚔️ +{item.stats.attack}</Text>
                </View>
              )}
              {item.stats?.defense && (
                <View style={[styles.msShopStatBadge, { backgroundColor: '#B2F2FF' }]}>
                  <Text style={styles.statBadgeText}>🛡️ +{item.stats.defense}</Text>
                </View>
              )}
              {item.stats?.health && (
                <View style={[styles.msShopStatBadge, { backgroundColor: '#FFD6E0' }]}>
                  <Text style={styles.statBadgeText}>❤️ +{item.stats.health}</Text>
                </View>
              )}
              {item.effect && (
                <View style={[styles.msShopStatBadge, { backgroundColor: '#E6FCF5' }]}>
                  <Text style={[styles.statBadgeText, { color: '#333' }]}>{item.effect}</Text>
                </View>
              )}
            </View>
            {!canBuy && <Text style={styles.msShopLevelReq}>🔒 Lv.{item.requiredLevel} 필요</Text>}
          </View>
          <View style={styles.msShopItemActions}>
            <View style={styles.msShopPriceBadge}>
              <Text style={styles.msShopPriceText}>💰 {item.price}</Text>
            </View>
            {!isOwned ? (
              <TouchableOpacity
                style={[
                  styles.msShopBuyBtn,
                  {
                    opacity: canBuy && gold >= item.price ? 1 : 0.5,
                    backgroundColor: canBuy && gold >= item.price ? '#FF6B95' : '#999',
                  },
                ]}
                onPress={() => buyItem(item)}
                disabled={!canBuy || gold < item.price}
              >
                <Text style={styles.msShopBuyBtnText}>{!canBuy ? '🔒' : gold < item.price ? '💸' : '구매'}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.msShopEquipBtn, { backgroundColor: isEquipped ? '#4CAF50' : '#667eea' }]}
                onPress={() => equipItem(item)}
              >
                <Text style={styles.msShopBuyBtnText}>{isEquipped ? '✓ 장착됨' : '⚡ 장착'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const { width, height } = Dimensions.get('window');

  // 아이템 상세 모달 컴포넌트
  const ItemDetailsModal = () => (
    <Modal
      visible={!!showItemDetails}
      transparent={true}
      animationType='fade'
      onRequestClose={() => setShowItemDetails(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {showItemDetails && (
            <>
              <Text style={styles.modalTitle}>{showItemDetails.name}</Text>
              <Image source={showItemDetails.image} style={styles.modalImage} />
              <Text style={styles.modalDescription}>{showItemDetails.description}</Text>
              {showItemDetails.stats && (
                <View style={styles.modalStats}>
                  {showItemDetails.stats.attack && (
                    <Text style={styles.modalStatText}>⚔️ 공격력: +{showItemDetails.stats.attack}</Text>
                  )}
                  {showItemDetails.stats.defense && (
                    <Text style={styles.modalStatText}>🛡️ 방어력: +{showItemDetails.stats.defense}</Text>
                  )}
                  {showItemDetails.stats.health && (
                    <Text style={styles.modalStatText}>❤️ 체력: +{showItemDetails.stats.health}</Text>
                  )}
                </View>
              )}
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowItemDetails(null)}>
                <Text style={styles.modalCloseBtnText}>닫기</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='auto' />
      <LinearGradient
        colors={['#fbcfe8', '#c084fc', '#fecdd3']}
        // colors={['#667eea', '#a5f3fc', '#8b5cf6']}
        // colors={['#667eea', '#764ba2', '#60a5fa']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.header}>
        <Animated.View style={{ transform: [{ scale: 1 }] }}>
          <Text style={[styles.title, { color: '#fff' }]}>✨ 캐릭터 ✨</Text>
        </Animated.View>
        <Animated.View style={[styles.goldContainer, { transform: [{ scale: goldAnim }] }]}>
          <Text style={styles.goldIcon}>💰</Text>
          <Text style={[styles.gold, { color: '#fff' }]}>{gold}</Text>
        </Animated.View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'character' && styles.activeTab]}
          onPress={() => switchTab('character')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, { color: activeTab === 'character' ? '#667eea' : 'rgba(255,255,255,0.7)' }]}>
            🧙‍♂️ 캐릭터
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shop' && styles.activeTab]}
          onPress={() => switchTab('shop')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, { color: activeTab === 'shop' ? '#667eea' : 'rgba(255,255,255,0.7)' }]}>
            🛒 상점
          </Text>
        </TouchableOpacity>
      </View>

      <ItemDetailsModal />

      {activeTab === 'character' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 캐릭터 카드 영역 */}
          <View style={[styles.msCharacterCard, { backgroundColor: '#fff' }]}>
            <View style={styles.msAvatarWrapper}>
              <View style={styles.msAvatarCircle}>
                <Image source={getCharacterImage()} style={styles.msAvatarImage} resizeMode='cover' />
              </View>
            </View>
            <View style={styles.msBadgesRow}>
              <View style={[styles.msBadge, { backgroundColor: '#ffe066' }]}>
                <Text style={styles.msBadgeText}>Lv.{MOCK_USER.level}</Text>
              </View>
              <View style={[styles.msBadge, { backgroundColor: '#b2f2ff' }]}>
                <Text style={styles.msBadgeText}>💰 {gold}</Text>
              </View>
            </View>
            <View style={styles.msExpBarWrapper}>
              <View style={styles.msExpBarBg}>
                <View style={[styles.msExpBarFill, { width: `${(MOCK_USER.exp / MOCK_USER.nextLevelExp) * 100}%` }]} />
              </View>
              <Text style={styles.msExpBarText}>
                EXP {MOCK_USER.exp} / {MOCK_USER.nextLevelExp}
              </Text>
            </View>
          </View>

          {/* 능력치 카드 */}
          <View style={styles.msStatsRow}>
            <View style={[styles.msStatMiniCard, { backgroundColor: '#fffbe6', shadowColor: '#ffe066' }]}>
              <Text style={styles.msStatIcon}>❤️</Text>
              <Text style={styles.msStatValue}>{stats.health}</Text>
              <Text style={styles.msStatLabel}>체력</Text>
            </View>
            <View style={[styles.msStatMiniCard, { backgroundColor: '#e6fcf5', shadowColor: '#63e6be' }]}>
              <Text style={styles.msStatIcon}>⚔️</Text>
              <Text style={styles.msStatValue}>{stats.attack}</Text>
              <Text style={styles.msStatLabel}>공격</Text>
            </View>
            <View style={[styles.msStatMiniCard, { backgroundColor: '#e7f5ff', shadowColor: '#339af0' }]}>
              <Text style={styles.msStatIcon}>🛡️</Text>
              <Text style={styles.msStatValue}>{stats.defense}</Text>
              <Text style={styles.msStatLabel}>방어</Text>
            </View>
          </View>

          <View style={[styles.msEquipmentCard, { backgroundColor: '#fff' }]}>
            <Text style={[styles.msCardTitle, { color: textColor }]}>🎒 장착 장비</Text>
            <View style={styles.msEquipmentRow}>
              {/* 무기 */}
              <View style={styles.msEquipSlotWrapper}>
                <View style={[styles.msEquipCircle, { backgroundColor: '#ffe066', shadowColor: '#ffe066' }]}>
                  <Text style={styles.msEquipIcon}>⚔️</Text>
                </View>
                <Text style={styles.msEquipLabel}>무기</Text>
                {equippedItems.weapon ? (
                  <Text style={styles.msEquipName}>{SHOP_ITEMS.find((i) => i.id === equippedItems.weapon)?.name}</Text>
                ) : (
                  <Text style={styles.msEquipEmpty}>미장착</Text>
                )}
              </View>
              {/* 방패 */}
              <View style={styles.msEquipSlotWrapper}>
                <View style={[styles.msEquipCircle, { backgroundColor: '#b2f2ff', shadowColor: '#b2f2ff' }]}>
                  <Text style={styles.msEquipIcon}>🛡️</Text>
                </View>
                <Text style={styles.msEquipLabel}>방패</Text>
                {equippedItems.shield ? (
                  <Text style={styles.msEquipName}>{SHOP_ITEMS.find((i) => i.id === equippedItems.shield)?.name}</Text>
                ) : (
                  <Text style={styles.msEquipEmpty}>미장착</Text>
                )}
              </View>
              {/* 갑옷 */}
              <View style={styles.msEquipSlotWrapper}>
                <View style={[styles.msEquipCircle, { backgroundColor: '#ffd6e0', shadowColor: '#ffd6e0' }]}>
                  <Text style={styles.msEquipIcon}>👕</Text>
                </View>
                <Text style={styles.msEquipLabel}>갑옷</Text>
                {equippedItems.armor ? (
                  <Text style={styles.msEquipName}>{SHOP_ITEMS.find((i) => i.id === equippedItems.armor)?.name}</Text>
                ) : (
                  <Text style={styles.msEquipEmpty}>미장착</Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.shopContainer}>
          <ScrollView
            horizontal
            style={styles.categoriesContainer}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {ITEM_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonActive]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.id === 'weapon'
                    ? '⚔️ '
                    : category.id === 'armor'
                    ? '👕 '
                    : category.id === 'shield'
                    ? '🛡️ '
                    : category.id === 'consumable'
                    ? '🧪 '
                    : '🎁 '}
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={SHOP_ITEMS.filter((item) => selectedCategory === 'all' || item.type === selectedCategory)}
            renderItem={renderShopItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.shopList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  goldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goldIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  gold: {
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Character Card Styles
  msCharacterCard: {
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
    backgroundColor: '#fff',
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
    borderColor: '#ffe066',
    marginBottom: 6,
  },
  msExpBarFill: {
    height: '100%',
    backgroundColor: '#ffe066',
    borderRadius: 8,
  },
  msExpBarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b19700',
    textShadowColor: '#fffbe6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Stats Cards
  msStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 15,
    marginHorizontal: 5,
  },
  msStatMiniCard: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  msStatIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  msStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  msStatLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },

  // Equipment Card
  msEquipmentCard: {
    borderRadius: 25,
    padding: 25,
    marginBottom: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e7eaf6',
    shadowColor: '#b2f2ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 8,
    backgroundColor: '#fff',
  },
  msEquipmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
    gap: 12,
  },
  msEquipSlotWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  msEquipCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  msEquipIcon: {
    fontSize: 30,
    color: '#fff',
    textShadowColor: '#222',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  msEquipLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  msEquipName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 2,
  },
  msEquipEmpty: {
    fontSize: 14,
    color: '#bbb',
    fontStyle: 'italic',
    marginTop: 2,
  },
  msCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#333',
    letterSpacing: 0.5,
  },

  // Shop Styles
  shopContainer: {
    flex: 1,
  },
  categoriesContainer: {
    maxHeight: 55,
    marginHorizontal: 20,
    marginBottom: 18,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#ffd43b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryButtonText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoryButtonTextActive: {
    color: '#333',
  },
  shopList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Shop Item Card
  msShopItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 20,
    shadowColor: '#b2f2ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#e7eaf6',
  },
  msShopItemLeft: {
    marginRight: 16,
  },
  msShopItemImageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffe066',
    shadowColor: '#ffe066',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  msShopItemImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  equippedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  equippedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  msShopItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  msShopItemName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  msShopItemDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  msShopItemStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  msShopStatBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 3,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  msShopLevelReq: {
    fontSize: 13,
    color: '#FF4500',
    fontWeight: 'bold',
    marginTop: 3,
  },
  msShopItemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    marginLeft: 12,
  },
  msShopPriceBadge: {
    backgroundColor: '#ffe066',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  msShopPriceText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  msShopBuyBtn: {
    backgroundColor: '#FF6B95',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  msShopBuyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  msShopEquipBtn: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    maxWidth: '90%',
    minWidth: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#ffe066',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalStats: {
    alignSelf: 'stretch',
    marginBottom: 25,
  },
  modalStatText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalCloseBtn: {
    backgroundColor: '#FF6B95',
    borderRadius: 15,
    paddingHorizontal: 25,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  modalCloseBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
