import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { EmptyDayProps, MultiDotDayProps, SingleDotDayProps } from '@/types/calendar';

export function SingleDotDay({
  date,
  state,
  isSelected,
  dotColor,
  incompleteTodoCount,
  onDayPress,
}: SingleDotDayProps) {
  return (
    <Pressable style={styles.dayContainer} onPress={() => onDayPress(date)}>
      <View style={[styles.dayTextContainer, isSelected && styles.selectedDayContainer]}>
        <Text
          style={[
            styles.dayText,
            state === 'disabled' ? styles.disabledText : null,
            isSelected ? styles.selectedDayText : null,
          ]}
        >
          {date.day}
        </Text>
      </View>
      <View style={[styles.todoIndicator, { backgroundColor: dotColor }, isSelected && styles.selectedTodoIndicator]}>
        {incompleteTodoCount === 0 ? (
          <Check size={16} strokeWidth={3} />
        ) : (
          <Text style={styles.todoCountText}>{incompleteTodoCount}</Text>
        )}
      </View>
    </Pressable>
  );
}

export function MultiDotDay({ date, state, isSelected, dots, incompleteTodoCount, onDayPress }: MultiDotDayProps) {
  const gradColors = dots.length === 1 ? [dots[0].color, dots[0].color] : dots.slice(0, 7).map((dot) => dot.color);
  const gradLocations =
    dots.length === 1 ? [0, 1] : dots.slice(0, 7).map((_, idx) => idx / (Math.min(dots.length, 7) - 1 || 1));

  return (
    <Pressable style={styles.dayContainer} onPress={() => onDayPress(date)}>
      <View style={[styles.dayTextContainer, isSelected && styles.selectedDayContainer]}>
        <Text
          style={[
            styles.dayText,
            state === 'disabled' ? styles.disabledText : null,
            isSelected ? styles.selectedDayText : null,
          ]}
        >
          {date.day}
        </Text>
      </View>
      <LinearGradient
        style={[styles.splitColorContainer, isSelected && styles.selectedTodoIndicator]}
        colors={gradColors as [string, string, ...string[]]}
        locations={gradLocations as [number, number, ...number[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {incompleteTodoCount === 0 ? (
          <Check size={16} strokeWidth={3} />
        ) : (
          <Text style={styles.todoCountText}>{incompleteTodoCount}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function EmptyDay({ date, state, isSelected, todoCount, onDayPress }: EmptyDayProps) {
  return (
    <Pressable style={styles.dayContainer} onPress={() => onDayPress(date)}>
      <View style={[styles.dayTextContainer, isSelected && styles.selectedDayContainer]}>
        <Text
          style={[
            styles.dayText,
            state === 'disabled' ? styles.disabledText : null,
            isSelected ? styles.selectedDayText : null,
          ]}
        >
          {date.day}
        </Text>
      </View>
      <View style={[styles.todoIndicator, isSelected && styles.selectedTodoIndicator]}>
        <Text style={styles.todoCountText}>{todoCount}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    width: 32,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayContainer: {
    backgroundColor: '#FF8DA1',
    borderRadius: 16,
    padding: 4,
  },
  dayText: {
    textAlign: 'center',
    fontSize: 14,
  },
  disabledText: {
    color: '#d9e1e8',
  },
  selectedDayText: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  todoIndicator: {
    height: 20,
    width: 20,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTodoIndicator: {
    transform: [{ scale: 1.1 }],
  },
  todoCountText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  splitColorContainer: {
    height: 20,
    width: 20,
    borderRadius: 5,
    marginTop: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
