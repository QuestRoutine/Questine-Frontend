import { ImageSourcePropType } from 'react-native';

export type UserInfo = {
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

export type AchievementProps = {
  achievement_id: number | null;
  title: string | null;
  description: string | null;
  is_unlocked: boolean;
  unlocked_at: string | null;
  icon: null;
  unlocked_user_count: number;
};

export type LevelProps = {
  level: number;
  exp: number;
  nextLevelExp: number;
  gold: number;
  remaining_exp: number;
  character_name: string;
  image_url: ImageSourcePropType | null;
};

export type RankingUser = {
  userId: number;
  nickname: string;
  level: number;
  exp: number;
  image_url?: ImageSourcePropType;
};

export type CharacterImageType = 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'level6' | 'level7' | 'level8';
