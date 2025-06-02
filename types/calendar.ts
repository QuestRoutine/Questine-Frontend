import { DateData } from 'react-native-calendars';

export type SingleDotDayProps = {
  date: DateData;
  state: string;
  isSelected: boolean;
  dotColor: string;
  incompleteTodoCount: number;
  onDayPress: (date: DateData) => void;
};

export type MarkedDates = {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    selectedColor?: string;
    dots?: Array<{ color: string }>;
    completedCount?: number;
    incompletedCount?: number;
    todoCount?: number;
  };
};

export type MultiDotDayProps = {
  date: DateData;
  state: string;
  isSelected: boolean;
  dots: { color: string }[];
  incompleteTodoCount: number;
  onDayPress: (date: DateData) => void;
};

export type EmptyDayProps = {
  date: DateData;
  state: string;
  isSelected: boolean;
  todoCount: number;
  onDayPress: (date: DateData) => void;
};
