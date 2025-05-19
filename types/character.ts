export interface CharacterStats {
  health: number;
  attack: number;
  defense: number;
}

export interface UserCharacter {
  level: number;
  exp: number;
  nextLevelExp: number;
  gold: number;
  stats: CharacterStats;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'shield' | 'armor' | 'consumable';
  price: number;
  requiredLevel: number;
  image: any;
  description: string;
  stats?: Partial<CharacterStats>;
  effect?: string;
}

export interface EquippedItems {
  weapon: string | null;
  shield: string | null;
  armor: string | null;
}

export type CharacterImageType = 'beginner' | 'intermediate' | 'advanced' | 'expert';
