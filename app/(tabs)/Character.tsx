import React, { useState, useRef, useEffect } from 'react';
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
import { UserCharacter, Item, EquippedItems, CharacterImageType } from '@/types/character';
import { Colors, QuestineColors } from '@/constants/Colors';
import axiosInstance from '@/api/axios';
import { useIsFocused } from '@react-navigation/native';

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

const GRID_HORIZONTAL_PADDING = 16;
const GRID_ITEM_MARGIN = 6; // msShopGridItem marginHorizontal
const GRID_NUM_COLUMNS = 3;
const GRID_ITEM_WIDTH = Math.floor(
  (Dimensions.get('window').width - GRID_HORIZONTAL_PADDING * 2 - GRID_ITEM_MARGIN * 2 * GRID_NUM_COLUMNS) /
    GRID_NUM_COLUMNS
);

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

type levelProps = {
  level: number;
  exp: number;
  nextLevelExp: number;
  gold: number;
  remaining_exp: number;
  character_name: string;
};

export default function CharacterScreen() {
  const isFocused = useIsFocused();
  const [characterInfo, setCharacterInfo] = useState<levelProps | null>(null);
  useEffect(() => {
    if (!isFocused) return;
    const fetchData = async () => {
      const {
        data: { data },
      } = await axiosInstance.get('/characters/me');
      setCharacterInfo(data);
      console.log(characterInfo);
    };
    fetchData();
  }, [isFocused]);

  const textColor = colors.text;
  const [activeTab, setActiveTab] = useState('character');
  const [equippedItems, setEquippedItems] = useState<EquippedItems>(INITIAL_EQUIPPED_ITEMS);
  const [inventory, setInventory] = useState<string[]>(['1', '3']);
  const [gold, setGold] = useState(MOCK_USER.gold);
  const [userStats, setUserStats] = useState(MOCK_USER.stats);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showItemDetails, setShowItemDetails] = useState<Item | null>(null);

  // 애니메이션 값들
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

  // 상점 아이템 중 NEW 표시할 id 예시
  const NEW_ITEM_IDS = ['1', '2'];

  const renderShopItem = ({ item }: { item: Item }) => {
    const isOwned = inventory.includes(item.id);
    const isEquipped = equippedItems[item.type as keyof EquippedItems] === item.id;
    const canBuy = MOCK_USER.level >= item.requiredLevel;
    const isNew = NEW_ITEM_IDS.includes(item.id);

    return (
      <View style={styles.msShopGridItem}>
        {/* NEW */}
        {isNew && (
          <View style={styles.msShopNewBadge}>
            <Text style={styles.msShopNewBadgeText}>NEW</Text>
          </View>
        )}
        <View style={styles.msShopGridImageWrapper}>
          <Image source={item.image} style={styles.msShopGridImage} resizeMode='contain' />
          {isEquipped && (
            <View style={styles.msShopEquippedMark}>
              <Text style={styles.msShopEquippedMarkText}>E</Text>
            </View>
          )}
        </View>
        <Text style={styles.msShopGridName} numberOfLines={1}>
          {item.name}
        </Text>

        {/* 스탯/효과 */}
        {item.stats && (
          <View style={styles.msShopGridStatsRow}>
            {Object.entries(item.stats).map(([key, value]) => (
              <View key={key} style={styles.msShopGridStatBadge}>
                <Text style={styles.msShopGridStatBadgeText}>
                  {key === 'attack' && '⚔️'}
                  {key === 'defense' && '🛡️'}
                  {key === 'health' && '❤️'} {value}
                </Text>
              </View>
            ))}
          </View>
        )}
        {item.effect && <Text style={styles.msShopGridEffect}>{item.effect}</Text>}
        {/* 레벨 제한 */}
        {item.requiredLevel > 1 && <Text style={styles.msShopGridLevelReq}>Lv.{item.requiredLevel} 이상</Text>}
        {/* 가격/버튼 */}
        <View style={styles.msShopGridBottomRow}>
          <View style={styles.msShopGridPriceBadge}>
            <Text style={styles.msShopGridPriceText}>💰 {item.price}</Text>
          </View>
          {isOwned ? (
            <TouchableOpacity
              style={[styles.msShopGridBtn, isEquipped ? styles.msShopGridBtnEquipped : styles.msShopGridBtnEquip]}
              disabled={isEquipped}
              onPress={() => equipItem(item)}
            >
              <Text style={styles.msShopGridBtnText}>{isEquipped ? '장착중' : '장착'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.msShopGridBtn, !canBuy && styles.msShopGridBtnDisabled]}
              disabled={!canBuy}
              onPress={() => buyItem(item)}
            >
              <Text style={styles.msShopGridBtnText}>구매</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
      <View style={styles.header}>
        <Animated.View style={{ transform: [{ scale: 1 }] }}>
          <Text style={styles.title}>✨ 캐릭터 ✨</Text>
        </Animated.View>
        <Animated.View style={[styles.goldContainer, { transform: [{ scale: goldAnim }] }]}>
          <Text style={styles.goldIcon}>💰</Text>
          <Text style={styles.gold}>{gold}</Text>
        </Animated.View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'character' && styles.activeTab]}
          onPress={() => switchTab('character')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, { color: activeTab === 'character' ? '#667eea' : '#000' }]}>🧙‍♂️ 캐릭터</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shop' && styles.activeTab]}
          onPress={() => switchTab('shop')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, { color: activeTab === 'shop' ? '#667eea' : '#000' }]}>🛒 상점</Text>
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
            {/* 닉네임 */}
            <Text numberOfLines={1} style={styles.msNickname}>
              {characterInfo?.character_name}
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
                      backgroundColor: '#ffe066',
                    },
                  ]}
                />
              </View>
              <Text style={styles.msExpBarText}>
                {characterInfo?.exp} / {characterInfo?.nextLevelExp} EXP
              </Text>
            </View>
          </View>

          {/* 능력치 카드 */}
          <View style={styles.msStatsRow}>
            {/* 체력 */}
            <View style={styles.statSlotBox}>
              <View style={[styles.statSlotBg, { borderColor: '#ffd6e0', shadowColor: '#ffd6e0' }]}>
                <Text style={styles.statSlotIcon}>❤️</Text>
                <Text style={styles.statSlotValue}>{stats.health}</Text>
              </View>
              <Text style={styles.statSlotLabel}>체력</Text>
            </View>
            {/* 공격 */}
            <View style={styles.statSlotBox}>
              <View style={[styles.statSlotBg, { borderColor: '#ffe066', shadowColor: '#ffe066' }]}>
                <Text style={styles.statSlotIcon}>⚔️</Text>
                <Text style={styles.statSlotValue}>{stats.attack}</Text>
              </View>
              <Text style={styles.statSlotLabel}>공격</Text>
            </View>
            {/* 방어 */}
            <View style={styles.statSlotBox}>
              <View style={[styles.statSlotBg, { borderColor: '#b2f2ff', shadowColor: '#b2f2ff' }]}>
                <Text style={styles.statSlotIcon}>🛡️</Text>
                <Text style={styles.statSlotValue}>{stats.defense}</Text>
              </View>
              <Text style={styles.statSlotLabel}>방어</Text>
            </View>
          </View>

          {/* 장착 장비 카드 영역 */}
          <View style={styles.msEquipmentCard}>
            <Text style={[styles.msCardTitle, { color: textColor }]}>🎒 장착 장비</Text>
            <View style={styles.equipGridContainer}>
              {/* 무기 슬롯 */}
              <View style={styles.equipSlotBox}>
                <View style={styles.equipSlotBg}>
                  {equippedItems.weapon ? (
                    <Image
                      source={SHOP_ITEMS.find((i) => i.id === equippedItems.weapon)?.image}
                      style={styles.equipItemImage}
                      resizeMode='contain'
                    />
                  ) : (
                    <Text style={styles.equipSlotEmpty}>⚔️</Text>
                  )}
                </View>
                <Text style={styles.equipSlotLabel}>무기</Text>
              </View>
              {/* 방패 슬롯 */}
              <View style={styles.equipSlotBox}>
                <View style={styles.equipSlotBg}>
                  {equippedItems.shield ? (
                    <Image
                      source={SHOP_ITEMS.find((i) => i.id === equippedItems.shield)?.image}
                      style={styles.equipItemImage}
                      resizeMode='contain'
                    />
                  ) : (
                    <Text style={styles.equipSlotEmpty}>🛡️</Text>
                  )}
                </View>
                <Text style={styles.equipSlotLabel}>방패</Text>
              </View>
              {/* 갑옷 슬롯 */}
              <View style={styles.equipSlotBox}>
                <View style={styles.equipSlotBg}>
                  {equippedItems.armor ? (
                    <Image
                      source={SHOP_ITEMS.find((i) => i.id === equippedItems.armor)?.image}
                      style={styles.equipItemImage}
                      resizeMode='contain'
                    />
                  ) : (
                    <Text style={styles.equipSlotEmpty}>👕</Text>
                  )}
                </View>
                <Text style={styles.equipSlotLabel}>갑옷</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.shopContainer}>
          {/* 카테고리 바 */}
          <View style={styles.categoriesBarCenter}>
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
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FlatList
            data={SHOP_ITEMS.filter((item) => selectedCategory === 'all' || item.type === selectedCategory)}
            renderItem={renderShopItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            numColumns={GRID_NUM_COLUMNS}
            contentContainerStyle={{
              paddingHorizontal: GRID_HORIZONTAL_PADDING,
              paddingBottom: 20,
            }}
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
    backgroundColor: '#fff',
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
  statSlotBox: {
    alignItems: 'center',
    width: 70,
  },
  statSlotBg: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f4f4f4',
    borderWidth: 2.5,
    borderColor: '#d1d5db',
    shadowColor: '#bdbdbd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statSlotIcon: {
    fontSize: 26,
    marginBottom: 2,
  },
  statSlotValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statSlotLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    marginTop: 2,
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
  equipGridContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 24,
    marginTop: 10,
    marginBottom: 10,
  },
  equipSlotBox: {
    alignItems: 'center',
    width: 70,
  },
  equipSlotBg: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f4f4f4',
    borderWidth: 2.5,
    borderColor: '#d1d5db',
    shadowColor: '#bdbdbd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  equipItemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  equipSlotEmpty: {
    fontSize: 28,
    color: '#bbb',
    opacity: 0.4,
  },
  equipSlotLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    marginTop: 2,
  },
  // Shop Styles
  shopContainer: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  categoriesBarCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    marginHorizontal: 6,
    backgroundColor: '#e9ecef',
    borderWidth: 2,
    borderColor: '#f6f7fa',
  },
  categoryButtonActive: {
    backgroundColor: '#ffe066',
    borderColor: '#ffd43b',
    shadowColor: '#ffd43b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryButtonText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#888',
  },
  categoryButtonTextActive: {
    color: '#b19700',
  },
  msShopGridItem: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: GRID_ITEM_MARGIN,
    width: GRID_ITEM_WIDTH,
    marginVertical: 8,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#ffd43b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 5,
    minHeight: 220,
    maxHeight: 250,
  },
  msShopNewBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B95',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#ff4d6d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  msShopNewBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
    textShadowColor: '#ffb3c6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  msShopGridImageWrapper: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
    marginTop: 7,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#ffe066',
    shadowColor: '#ffe066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  msShopGridImage: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  msShopEquippedMark: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  msShopEquippedMarkText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  msShopGridName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
    width: '100%',
  },
  msShopGridStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 2,
    gap: 3,
  },
  msShopGridStatBadge: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 2,
    marginBottom: 2,
  },
  msShopGridStatBadgeText: {
    fontSize: 11,
    color: '#555',
    fontWeight: 'bold',
  },
  msShopGridEffect: {
    fontSize: 12,
    color: '#4dabf7',
    marginBottom: 2,
    textAlign: 'center',
  },
  msShopGridLevelReq: {
    fontSize: 11,
    color: '#FF4500',
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  msShopGridBottomRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 6,
    gap: 0,
  },
  msShopGridPriceBadge: {
    backgroundColor: '#ffe066',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffd43b',
    marginBottom: 8,
    alignSelf: 'center',
  },
  msShopGridPriceText: {
    fontWeight: 'bold',
    color: '#b19700',
    fontSize: 14,
    textAlign: 'center',
  },
  msShopGridBtn: {
    borderRadius: 10,
    paddingHorizontal: 0,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: '#FF6B95',
    borderWidth: 1,
    borderColor: '#ff4d6d',
  },
  msShopGridBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textShadowColor: '#ffb3c6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  msShopGridBtnEquip: {
    backgroundColor: '#4dabf7',
    borderColor: '#228be6',
  },
  msShopGridBtnEquipped: {
    backgroundColor: '#bbb',
    borderColor: '#888',
  },
  msShopGridBtnDisabled: {
    backgroundColor: '#eee',
    borderColor: '#ccc',
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
  msCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#333',
    letterSpacing: 0.5,
  },
});
