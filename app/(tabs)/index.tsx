import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  SafeAreaView,
  View,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
} from 'react-native';
import { CalendarList, DateData } from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import '@/constants/Calendars';
import { useIsFocused } from '@react-navigation/native';
import { CalendarHeaderProps } from 'react-native-calendars/src/calendar/header';
import { useAddTodo, useDeleteTodo, useTodos, useToggleTodoComplete } from '@/hooks/useTodo';
import dayjs from 'dayjs';
import TodoInputSection from '../../components/TodoInputSection';
import TodoList from '../../components/TodoList';
import { SingleDotDay, MultiDotDay, EmptyDay } from '../../components/CalendarDayCells';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { QuestineColors } from '@/constants/Colors';
type MarkedDates = {
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

const COLORS = ['#fda4af', '#fdba74', '#fef08a', '#bef264', '#7dd3fc', '#c4b5fd', '#f0abfc'];

const DAY_CELL_WIDTH = 32;
const DAY_CELL_HEIGHT = 40;
const DAY_TEXT_FONT_SIZE = 14;
const DAY_SELECTED_RADIUS = 16;
const TODO_INDICATOR_SIZE = 20;
const TODO_INDICATOR_RADIUS = 5;
const CHECKBOX_SIZE = 20;
const CHECKBOX_RADIUS = 4;
const CHECKBOX_BORDER_WIDTH = 2;
const CHECKMARK_FONT_SIZE = 12;
const ADD_BUTTON_RADIUS = 8;
const ADD_BUTTON_COLOR = '#FF8DA1';
const EMPTY_MESSAGE_COLOR = '#888';

interface Todo {
  todo_id: number;
  content: string;
  completed: boolean;
  created_at: string;
  exp_reward: number;
  exp_shown?: boolean; // exp 토스트 메시지 표시 여부
  due_at: string;
}

export default function HomeScreen() {
  const isFocused = useIsFocused();
  const today = new Date().toISOString();
  const todayStr = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD');
  const [selected, setSelected] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const [year, month] = currentMonth.split('-');
  const { data: todos = [], isLoading: todosLoading, refetch } = useTodos(+year, +month);
  const toggleTodoComplete = useToggleTodoComplete(+year, +month);
  const addTodoMutation = useAddTodo(+year, +month);
  const deleteTodoMutation = useDeleteTodo(+year, +month);

  // 할 일 목록에 따라 날짜 마커 초기화
  useEffect(() => {
    setSelected(todayStr);
  }, []);

  useEffect(() => {
    updateAllMarkedDates();
  }, [todos]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    refetch();
  }, [isFocused, refetch]);

  // 모든 날짜의 마커를 할 일 목록에 맞게 업데이트
  const updateAllMarkedDates = () => {
    const newMarkedDates: MarkedDates = {};
    // const uniqueDates = [...new Set(todos.map((todo) => todo.due_at))];
    const uniqueDates = [...new Set(todos.map((todo) => dayjs(todo.due_at).local().format('YYYY-MM-DD')))];
    uniqueDates.forEach((date) => {
      const dayTodos = todos.filter((todo) => dayjs(todo.due_at).local().format('YYYY-MM-DD') === date);
      // const dayTodos = todos.filter((todo) => todo.due_at === date);
      const completedTodos = dayTodos.filter((todo) => todo.completed);
      const incompleteTodos = dayTodos.filter((todo) => !todo.completed);
      if (dayTodos.length === 0) {
        return;
      } else if (completedTodos.length === 0) {
        newMarkedDates[date] = {
          marked: true,
          dots: [],
          todoCount: dayTodos.length,
        };
      } else {
        const completedColors = completedTodos.map((_, index) => COLORS[index % COLORS.length]);
        newMarkedDates[date] = {
          marked: true,
          dots: completedColors.map((color) => ({ color })),
          completedCount: completedTodos.length,
          incompletedCount: incompleteTodos.length,
          todoCount: dayTodos.length,
        };
      }
    });
    setMarkedDates(newMarkedDates);
  };

  // 날짜 누를 시, 호출되는 함수
  const onDayPress = (day: DateData) => {
    // 이전에 선택된 날짜와 새로 선택된 날짜가 다른 경우에만 색상 변경
    if (selected !== day.dateString) {
      setSelected(day.dateString);
      console.log('날짜 선택됨:', day.dateString);
    }
  };

  // 월 변경 시, 호출되는 함수
  const onMonthChange = (month: DateData) => {
    const newMonth = `${month.year}-${String(month.month).padStart(2, '0')}-01`;
    setCurrentMonth(newMonth);
    if (month.month === +todayStr.split('-')[1]) {
      setSelected(todayStr);
    } else {
      setSelected(newMonth);
    }
  };

  // 할 일 추가
  const addTodo = useCallback(
    (content: string) => {
      if (!content.trim() || !selected) return;
      const now = dayjs().local();
      console.log(now.hour(), now.minute(), now.second());
      const dueAt = dayjs.tz(selected, 'Asia/Seoul').hour(now.hour()).minute(now.minute()).second(now.second());
      addTodoMutation.mutate({
        content,
        due_at: dueAt.toISOString(),
      });
    },
    [addTodoMutation, selected]
  );

  // 할 일 토글 (완료/미완료)
  const handleToggleTodo = useCallback(
    (todo: Todo) => {
      toggleTodoComplete.mutate({
        todo_id: todo.todo_id,
        completed: !todo.completed,
      });
    },
    [toggleTodoComplete]
  );

  const deleteTodoMemo = useCallback(
    (todo_id: number) => {
      deleteTodoMutation.mutateAsync(todo_id);
    },
    [deleteTodoMutation]
  );

  const filteredTodos = todos.filter((todo) => {
    const localDueDate = dayjs(todo.due_at).local().format('YYYY-MM-DD');
    return localDueDate === selected;
    // todo.due_at.split('T')[0] === selected;
  });

  // custom day
  const dayComponent = ({ date, state, marking }: any) => {
    const mark = marking || {};
    const isSelected = date.dateString === selected;
    const hasTodos = mark.todoCount && mark.todoCount > 0;
    const hasCompletedTodos = mark.completedCount && mark.completedCount > 0;
    const incompleteTodoCount = mark.incompletedCount || 0;
    const dots = mark.dots || [];

    if (hasTodos) {
      if (hasCompletedTodos) {
        if (dots.length === 1) {
          return (
            <SingleDotDay
              date={date}
              state={state}
              isSelected={isSelected}
              dotColor={dots[0].color}
              incompleteTodoCount={incompleteTodoCount}
              onDayPress={(d) =>
                onDayPress({
                  dateString: d.dateString,
                  day: d.day,
                  month: d.month,
                  year: d.year,
                  timestamp: d.timestamp,
                })
              }
            />
          );
        } else if (dots.length > 1) {
          return (
            <MultiDotDay
              date={date}
              state={state}
              isSelected={isSelected}
              dots={dots}
              incompleteTodoCount={incompleteTodoCount}
              onDayPress={(d) =>
                onDayPress({
                  dateString: d.dateString,
                  day: d.day,
                  month: d.month,
                  year: d.year,
                  timestamp: d.timestamp,
                })
              }
            />
          );
        }
        if (incompleteTodoCount > 0) {
          return (
            <SingleDotDay
              date={date}
              state={state}
              isSelected={isSelected}
              dotColor={dots[0]?.color || '#f0f0f0'}
              incompleteTodoCount={incompleteTodoCount}
              onDayPress={(d) =>
                onDayPress({
                  dateString: d.dateString,
                  day: d.day,
                  month: d.month,
                  year: d.year,
                  timestamp: d.timestamp,
                })
              }
            />
          );
        }
      } else {
        // 모든 할일이 미완료인 경우
        return (
          <EmptyDay
            date={date}
            state={state}
            isSelected={isSelected}
            todoCount={mark.todoCount}
            onDayPress={(d) =>
              onDayPress({
                dateString: d.dateString,
                day: d.day,
                month: d.month,
                year: d.year,
                timestamp: d.timestamp,
              })
            }
          />
        );
      }
    }
    // 기본(할 일 없음)
    return (
      <Pressable
        style={styles.dayContainer}
        onPress={() =>
          onDayPress({
            dateString: date.dateString,
            day: date.day,
            month: date.month,
            year: date.year,
            timestamp: date.timestamp,
          })
        }
      >
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
        <View style={[styles.todoIndicator, isSelected && styles.selectedTodoIndicator]} />
      </Pressable>
    );
  };

  const customHeader = (props: CalendarHeaderProps) => {
    const year = props.month?.getFullYear();
    const month = props.month?.getMonth() + 1;
    const today = new Date();
    const isCurrentMonth =
      props.month && props.month.getFullYear() === today.getFullYear() && props.month.getMonth() === today.getMonth();

    // 월 변경 시 호출할 공통 함수
    const handleMonthChange = (monthOffset: number) => {
      if (props.month && props.addMonth) {
        const newDate = new Date(props.month);
        newDate.setMonth(newDate.getMonth() + monthOffset);
        props.addMonth(monthOffset);

        // onMonthChange 외부 상태 업데이트 (동기화)
        onMonthChange({
          year: newDate.getFullYear(),
          month: newDate.getMonth() + 1,
          day: 1,
          timestamp: newDate.getTime(),
          dateString: `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-01`,
        });
      }
    };

    // 오늘 이동 함수
    const goToToday = () => {
      setSelected(todayStr);
      // 달력의 현재 월과 오늘 날짜의 월 차이 계산
      if (props.month) {
        const currentMonth = props.month.getMonth();
        const targetMonth = today.getMonth();
        const currentYear = props.month.getFullYear();
        const targetYear = today.getFullYear();

        // 연도 차이 고려한 월 차이 계산
        const monthDiff = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);

        if (monthDiff !== 0) {
          handleMonthChange(monthDiff);
        }
      }
    };

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => handleMonthChange(-1)}>
            <Text style={{ fontSize: 20, color: '#FF8DA1' }}>◀</Text>
          </Pressable>

          {!isCurrentMonth && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                position: 'absolute',
                marginLeft: 24,
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: '#FEE2E8',
                borderRadius: 12,
              }}
              onPress={goToToday}
            >
              <Text style={{ color: '#FF8DA1', fontWeight: '600', fontSize: 14 }}>오늘</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {year}년 {String(month).padStart(2, '0')}월
        </Text>

        <Pressable onPress={() => handleMonthChange(1)} style={{ padding: 5 }}>
          <Text style={{ fontSize: 20, color: '#FF8DA1' }}>▶</Text>
        </Pressable>
      </View>
    );
  };
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      updateAllMarkedDates();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '데이터를 새로고침하는데 실패했습니다.',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        enableOnAndroid
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{ flexGrow: 1 }}
        extraScrollHeight={150}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={QuestineColors.PINK_300}
            colors={[QuestineColors.PINK_300, QuestineColors.PINK_400, QuestineColors.PINK_500]}
            progressBackgroundColor={QuestineColors.WHITE}
          />
        }
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/Questine2.png')}
            style={{
              width: 150,
              height: 60,
            }}
            resizeMode='contain'
            accessibilityLabel='Questine Logo'
          />
        </View>
        {todosLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size='large' color='hotpink' />
          </View>
        )}
        <>
          <CalendarList
            key={currentMonth}
            current={currentMonth}
            style={styles.calendar}
            onDayPress={onDayPress}
            horizontal
            pagingEnabled
            onMonthChange={onMonthChange}
            markedDates={markedDates}
            dayComponent={dayComponent}
            calendarStyle={styles.calendarStyle}
            hideArrows={false}
            customHeader={customHeader}
          />
          {selected ? (
            <View style={styles.todoSection}>
              <Text style={styles.selectedDateText}>{selected} 할 일</Text>
              <TodoInputSection addTodo={addTodo} isLoading={addTodoMutation.status === 'pending'} />
              <TodoList filteredTodos={filteredTodos} handleToggleTodo={handleToggleTodo} deleteTodo={deleteTodoMemo} />
            </View>
          ) : (
            <View style={styles.noDateSelectedContainer}>
              <Text style={styles.noDateSelectedText}>날짜를 선택하여 할 일을 관리하세요</Text>
            </View>
          )}
        </>

        {/* 하단 여백을 위한 빈 공간 */}
        <View style={styles.bottomPadding} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 999,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    color: '#FF8DA1',
    marginHorizontal: 'auto',
  },
  calendar: {
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  calendarStyle: {
    paddingBottom: 10,
  },
  dayContainer: {
    width: DAY_CELL_WIDTH,
    height: DAY_CELL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayContainer: {
    backgroundColor: ADD_BUTTON_COLOR,
    borderRadius: DAY_SELECTED_RADIUS,
    padding: 4,
  },
  dayText: {
    textAlign: 'center',
    fontSize: DAY_TEXT_FONT_SIZE,
  },
  disabledText: {
    color: '#d9e1e8',
  },
  selectedDayText: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  todoIndicator: {
    height: TODO_INDICATOR_SIZE,
    width: TODO_INDICATOR_SIZE,
    borderRadius: TODO_INDICATOR_RADIUS,
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
  todoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    // height: '100%',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8DA1',
    marginBottom: 10,
  },
  todoInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  todoInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: ADD_BUTTON_COLOR,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ADD_BUTTON_RADIUS,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todoListContainer: {
    marginTop: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: CHECKBOX_RADIUS,
    borderWidth: CHECKBOX_BORDER_WIDTH,
    borderColor: '#ddd',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#B5EAD7',
    borderColor: '#B5EAD7',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: CHECKMARK_FONT_SIZE,
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#FF8DA1',
    fontWeight: 'bold',
  },
  emptyMessage: {
    marginTop: 20,
    textAlign: 'center',
    color: EMPTY_MESSAGE_COLOR,
    fontStyle: 'italic',
  },
  noDateSelectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDateSelectedText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  splitColorContainer: {
    height: TODO_INDICATOR_SIZE,
    width: TODO_INDICATOR_SIZE,
    borderRadius: TODO_INDICATOR_RADIUS,
    marginTop: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 30,
  },
});
