import React, { useState } from 'react';
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
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StatusBar } from 'expo-status-bar';
import { UserCharacter, Item, EquippedItems, CharacterImageType } from '@/types/character';
import { Colors } from '@/constants/Colors';

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
  // advanced: require('@/assets/images/characters/class2.png'), // 레벨 8-10
  // expert: require('@/assets/images/characters/class3.png'), // 레벨 11+
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

  const [activeTab, setActiveTab] = useState('character'); // 'character' or 'shop'
  const [equippedItems, setEquippedItems] = useState<EquippedItems>(INITIAL_EQUIPPED_ITEMS);
  const [inventory, setInventory] = useState<string[]>(['1', '3']); // 초기에 몇 개의 아이템을 가지고 있음
  const [gold, setGold] = useState(MOCK_USER.gold);
  const [userStats, setUserStats] = useState(MOCK_USER.stats);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      alert(`🎉 ${item.name}을(를) 구매했습니다!`);
    } else if (MOCK_USER.level < item.requiredLevel) {
      alert(`⚠️ 이 아이템을 구매하려면 레벨 ${item.requiredLevel}이 필요합니다.`);
    } else {
      alert('💸 골드가 부족합니다!');
    }
  };

  // 아이템 장착
  const equipItem = (item: Item) => {
    if (inventory.includes(item.id)) {
      // 이전에 장착된 같은 타입의 아이템 스탯 제거
      const previousItemId = equippedItems[item.type as keyof EquippedItems];
      if (previousItemId) {
        const previousItem = SHOP_ITEMS.find((i) => i.id === previousItemId);
        if (previousItem && previousItem.stats) {
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
          health: prevStats.health + (item.stats.health || 0),
          attack: prevStats.attack + (item.stats.attack || 0),
          defense: prevStats.defense + (item.stats.defense || 0),
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

  // 필터링된 아이템 목록
  const filteredItems =
    selectedCategory === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter((item) => item.type === selectedCategory);

  // 스탯 바 컴포넌트
  const StatBar = ({
    value,
    maxValue,
    color,
    icon,
  }: {
    value: number;
    maxValue: number;
    color: string;
    icon: string;
  }) => {
    const percentage = (value / maxValue) * 100;
    return (
      <View style={styles.statBarContainer}>
        <Text style={[styles.statIcon, { color: textColor }]}>{icon}</Text>
        <View style={styles.statBarBackground}>
          <View style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
        <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      </View>
    );
  };

  const renderShopItem = ({ item }: { item: Item }) => {
    const isOwned = inventory.includes(item.id);
    const isEquipped = equippedItems[item.type as keyof EquippedItems] === item.id;
    const canBuy = MOCK_USER.level >= item.requiredLevel;

    return (
      <View style={[styles.shopItem, { backgroundColor: cardBgColor }]}>
        <View style={styles.shopItemImageContainer}>
          <Image source={item.image} style={styles.shopItemImage} />
          {isEquipped && (
            <View style={styles.equipBadge}>
              <Text style={styles.equipBadgeText}>장착</Text>
            </View>
          )}
        </View>
        <View style={styles.shopItemDetails}>
          <Text style={[styles.shopItemName, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.shopItemDescription, { color: textColor }]}>{item.description}</Text>
          {!canBuy && (
            <View style={styles.levelRequirementContainer}>
              <Text style={styles.levelRequirement}>🔒 레벨 {item.requiredLevel} 필요</Text>
            </View>
          )}
          {item.stats && (
            <View style={styles.statsContainer}>
              {item.stats.attack && (
                <View style={styles.statBubble}>
                  <Text style={styles.statBubbleText}>⚔️ +{item.stats.attack}</Text>
                </View>
              )}
              {item.stats.defense && (
                <View style={styles.statBubble}>
                  <Text style={styles.statBubbleText}>🛡️ +{item.stats.defense}</Text>
                </View>
              )}
              {item.stats.health && (
                <View style={styles.statBubble}>
                  <Text style={styles.statBubbleText}>❤️ +{item.stats.health}</Text>
                </View>
              )}
            </View>
          )}
          {item.effect && <Text style={{ color: accentColor }}>{item.effect}</Text>}
        </View>
        <View style={styles.shopItemActions}>
          <View style={styles.priceContainer}>
            <Text style={styles.goldIcon}>💰</Text>
            <Text style={[styles.shopItemPrice, { color: textColor }]}>{item.price}</Text>
          </View>
          {!isOwned ? (
            <TouchableOpacity
              style={[
                styles.buyButton,
                {
                  opacity: canBuy && gold >= item.price ? 1 : 0.5,
                  backgroundColor: canBuy && gold >= item.price ? accentColor : '#888',
                },
              ]}
              onPress={() => buyItem(item)}
              disabled={!canBuy || gold < item.price}
            >
              <Text style={styles.buyButtonText}>구매</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.equipButton, { backgroundColor: isEquipped ? '#4CAF50' : '#2196F3' }]}
              onPress={() => equipItem(item)}
            >
              <Text style={styles.buyButtonText}>{isEquipped ? '장착됨' : '장착'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  const { width, height } = Dimensions.get('window');
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='auto' />

      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>✨ 캐릭터 ✨</Text>
        <View style={styles.goldContainer}>
          <Text style={styles.goldIcon}>💰</Text>
          <Text style={[styles.gold, { color: textColor }]}>{gold}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'character' && styles.activeTab]}
          onPress={() => setActiveTab('character')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'character' ? '#fff' : textColor }]}>🧙‍♂️ 캐릭터</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shop' && styles.activeTab]}
          onPress={() => setActiveTab('shop')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'shop' ? '#fff' : textColor }]}>🛒 상점</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'character' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.characterCard, { backgroundColor: cardBgColor }]}>
            <View style={styles.characterImageContainer}>
              <Image source={getCharacterImage()} style={styles.characterImage} resizeMode='contain' />
            </View>

            <View style={styles.levelInfo}>
              <Text style={[styles.levelText, { color: textColor }]}>레벨 {MOCK_USER.level}</Text>
              <View style={styles.expBarContainer}>
                <View style={styles.expBar}>
                  <View style={[styles.expProgress, { width: `${(MOCK_USER.exp / MOCK_USER.nextLevelExp) * 100}%` }]} />
                </View>
                <Text style={[styles.expText, { color: textColor }]}>
                  {MOCK_USER.exp} / {MOCK_USER.nextLevelExp} EXP
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.statsCard, { backgroundColor: cardBgColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>⚡ 캐릭터 능력치</Text>

            <StatBar value={stats.health} maxValue={200} color='#FF6B6B' icon='❤️' />

            <StatBar value={stats.attack} maxValue={50} color='#4ECDC4' icon='⚔️' />

            <StatBar value={stats.defense} maxValue={40} color='#45B3E0' icon='🛡️' />
          </View>

          <View style={[styles.equipmentCard, { backgroundColor: cardBgColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>🎒 장착 장비</Text>
            <View style={styles.equipmentList}>
              {/* 장비 아이템들 표시 */}
              <View style={[styles.equipmentSlot, { borderColor: 'rgba(255, 107, 149, 0.2)' }]}>
                <View style={styles.equipmentIconContainer}>
                  <Text style={styles.equipmentIcon}>⚔️</Text>
                </View>
                <Text style={[styles.slotName, { color: textColor }]}>무기:</Text>
                {equippedItems.weapon ? (
                  <Text style={[styles.slotItem, { color: accentColor }]}>
                    {SHOP_ITEMS.find((i) => i.id === equippedItems.weapon)?.name}
                  </Text>
                ) : (
                  <Text style={[styles.slotItemEmpty]}>미장착</Text>
                )}
              </View>

              <View style={[styles.equipmentSlot, { borderColor: 'rgba(255, 107, 149, 0.2)' }]}>
                <View style={styles.equipmentIconContainer}>
                  <Text style={styles.equipmentIcon}>🛡️</Text>
                </View>
                <Text style={[styles.slotName, { color: textColor }]}>방패:</Text>
                {equippedItems.shield ? (
                  <Text style={[styles.slotItem, { color: accentColor }]}>
                    {SHOP_ITEMS.find((i) => i.id === equippedItems.shield)?.name}
                  </Text>
                ) : (
                  <Text style={[styles.slotItemEmpty]}>미장착</Text>
                )}
              </View>

              <View style={[styles.equipmentSlot, { borderColor: 'rgba(255, 107, 149, 0.2)' }]}>
                <View style={styles.equipmentIconContainer}>
                  <Text style={styles.equipmentIcon}>👕</Text>
                </View>
                <Text style={[styles.slotName, { color: textColor }]}>갑옷:</Text>
                {equippedItems.armor ? (
                  <Text style={[styles.slotItem, { color: accentColor }]}>
                    {SHOP_ITEMS.find((i) => i.id === equippedItems.armor)?.name}
                  </Text>
                ) : (
                  <Text style={[styles.slotItemEmpty]}>미장착</Text>
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
            data={filteredItems}
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
  goldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goldIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  gold: {
    fontSize: 16,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  characterCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  characterImageContainer: {
    position: 'relative',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleEffect: {
    position: 'absolute',
    width: 180,
    height: 180,
    opacity: 0.5,
  },
  characterImage: {
    width: 128,
    height: 128,
    marginBottom: 10,
  },
  levelInfo: {
    width: '100%',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  expBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  expBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  expProgress: {
    height: '100%',
    backgroundColor: '#FF6B95',
    borderRadius: 6,
  },
  expText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statIcon: {
    fontSize: 18,
    marginRight: 10,
    width: 26,
  },
  statBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statValue: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  statName: {
    fontSize: 16,
  },
  equipmentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  equipmentList: {
    width: '100%',
  },
  equipmentSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  equipmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 149, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  equipmentIcon: {
    fontSize: 18,
  },
  slotName: {
    fontSize: 16,
    width: 50,
  },
  slotItem: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  slotItemEmpty: {
    fontSize: 16,
    color: '#AAA',
    fontStyle: 'italic',
    flex: 1,
  },
  // 상점 스타일
  shopContainer: {
    flex: 1,
  },
  categoriesContainer: {
    maxHeight: 50,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B95',
  },
  categoryButtonText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#FFF',
  },
  shopList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  shopItem: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopItemImageContainer: {
    position: 'relative',
  },
  shopItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 149, 0.1)',
  },
  equipBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  equipBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  shopItemDetails: {
    flex: 1,
    paddingHorizontal: 16,
  },
  shopItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  shopItemDescription: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  levelRequirementContainer: {
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  levelRequirement: {
    fontSize: 13,
    color: '#FF4500',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  statBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  statBubbleText: {
    fontSize: 13,
  },
  shopItemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shopItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#FF6B95',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  equipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
