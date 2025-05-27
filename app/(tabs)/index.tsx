import { useState, useEffect } from 'react';
import {
  Text,
  SafeAreaView,
  View,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Keyboard,
} from 'react-native';
import { CalendarList, DateData } from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import '@/constants/Calendars';
import { Check } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import { CalendarHeaderProps } from 'react-native-calendars/src/calendar/header';
import { useAddTodo, useDeleteTodo, useTodos, useToggleTodoComplete } from '@/hooks/useTodo';

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

interface Todo {
  todo_id: number;
  content: string;
  completed: boolean;
  created_at: string;
  exp_reward: number;
  exp_shown?: boolean; // 경험치 토스트 메시지가 표시되었는지 여부를 저장
  due_at: string;
}

export default function HomeScreen() {
  const isFocused = useIsFocused();
  const today = new Date().toISOString();
  const todayStr = today.split('T')[0];
  const [selected, setSelected] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [newTodo, setNewTodo] = useState('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  // 할 일 목록에 따라 날짜 마커 초기화
  useEffect(() => {
    setSelected(today.split('T')[0]);
  }, []);

  const { data: todos = [], isLoading: todosLoading, refetch } = useTodos();
  const toggleTodoComplete = useToggleTodoComplete();
  const addTodoMutation = useAddTodo(() => setNewTodo(''));
  const deleteTodoMutation = useDeleteTodo();
  const deleteTodo = async (todo_id: number) => await deleteTodoMutation.mutateAsync(todo_id);

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
    const uniqueDates = [...new Set(todos.map((todo) => todo.due_at))];
    uniqueDates.forEach((date) => {
      const dayTodos = todos.filter((todo) => todo.due_at === date);
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
      const selectedColor = COLORS[0];
      setSelected(day.dateString);
      console.log('onDayPress ', day.dateString);
      console.log('날짜 선택됨:', day.dateString, '색상:', selectedColor);
    }
  };

  // 월 변경 시, 호출되는 함수
  const onMonthChange = (month: DateData) => {
    const newMonth = `${month.year}-${month.month < 10 ? '0' + month.month : month.month}-01`;
    console.log('New month string:', newMonth);
    setCurrentMonth(newMonth);
    if (month.month === +todayStr.split('-')[1]) {
      setSelected(todayStr);
    } else {
      setSelected(newMonth);
    }
  };

  // 할 일 추가
  const addTodo = () => {
    if (!newTodo.trim() || !selected) return;
    addTodoMutation.mutate({
      content: newTodo,
      due_at: new Date(selected).toISOString(),
    });
  };

  // 할 일 토글 (완료/미완료)
  const handleToggleTodo = (todo: Todo) => {
    toggleTodoComplete.mutate({
      todo_id: todo.todo_id,
      completed: !todo.completed,
    });
  };

  // 선택된 날짜의 할 일 필터링
  const filteredTodos = todos.filter((todo) => todo.due_at.split('T')[0] === selected);

  // custom day
  const dayComponent = ({ date, state, marking }: any) => {
    // 해당 날짜에 대한 마커 정보 가져오기
    const mark = marking || {};
    const isSelected = date.dateString === selected;
    const hasTodos = mark.todoCount && mark.todoCount > 0;
    const hasCompletedTodos = mark.completedCount && mark.completedCount > 0;
    const incompleteTodoCount = mark.incompletedCount || 0;

    // 날짜 셀 색상 설정
    let dayBackgroundStyle = {};
    let todoCountText = null;

    if (hasTodos) {
      if (hasCompletedTodos) {
        // 완료된 할일이 있는 경우
        const dots = mark.dots || [];

        if (dots.length === 1) {
          // 완료된 할일이 하나뿐인 경우 단일 색상
          dayBackgroundStyle = {
            backgroundColor: dots[0].color,
          };

          if (incompleteTodoCount === 0) {
            todoCountText = <Check size={16} strokeWidth={3} />;
          } else if (incompleteTodoCount > 0) {
            todoCountText = <Text style={styles.todoCountText}>{incompleteTodoCount}</Text>;
          }
        } else if (dots.length > 1) {
          // 색상 분할을 위한 스타일 반환
          return (
            <Pressable
              style={styles.dayContainer}
              onPress={() => {
                onDayPress({
                  dateString: date.dateString,
                  day: date.day,
                  month: date.month,
                  year: date.year,
                  timestamp: date.timestamp,
                });
              }}
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

              <LinearGradient
                style={[styles.splitColorContainer, isSelected && styles.selectedTodoIndicator]}
                colors={dots.slice(0, 7).map((dot: { color: string }) => dot.color)}
                locations={dots.slice(0, 7).map((v: any, index: number) => index / (Math.min(dots.length, 7) - 1 || 1))}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                {/* 미완료 할일 카운트가 있는 경우 표시 */}
                {incompleteTodoCount === 0 ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  incompleteTodoCount > 0 && <Text style={styles.todoCountText}>{incompleteTodoCount}</Text>
                )}
              </LinearGradient>
            </Pressable>
          );
        }

        // 미완료 할일이 있으면 카운트 표시
        if (incompleteTodoCount > 0 && !todoCountText) {
          todoCountText = <Text style={styles.todoCountText}>{incompleteTodoCount}</Text>;
        }
      } else {
        // 모든 할일이 미완료인 경우 카운트만 표시
        todoCountText = <Text style={styles.todoCountText}>{mark.todoCount}</Text>;
      }
    }

    return (
      <Pressable
        style={styles.dayContainer}
        onPress={() => {
          onDayPress({
            dateString: date.dateString,
            day: date.day,
            month: date.month,
            year: date.year,
            timestamp: date.timestamp,
          });
        }}
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

        <View style={[styles.todoIndicator, dayBackgroundStyle, isSelected && styles.selectedTodoIndicator]}>
          {todoCountText}
        </View>
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
          {year}년 {month < 10 ? `0${month}` : month}월
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'height' : 'padding'} style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps='handled'
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        >
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/Questine.png')}
              style={{
                width: 150,
                height: 60,
              }}
              resizeMode='contain'
              accessibilityLabel='Questine Logo'
            />
            <Image src='../../assets/images/Questine.png' alt='Questine Logo' />
          </View>
          {todosLoading && (
            <View style={styles.loadingOverlay}>
              {/* <View style={styles.loadingBox}> */}
              <ActivityIndicator size='large' color='hotpink' />
              {/* </View> */}
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
                <View style={styles.todoInputContainer}>
                  <TextInput
                    style={styles.todoInput}
                    value={newTodo}
                    onChangeText={setNewTodo}
                    onSubmitEditing={() => {
                      if (!newTodo.trim()) {
                        Keyboard.dismiss();
                        return;
                      }
                      addTodo();
                    }}
                    submitBehavior='submit'
                    placeholder='새로운 할 일을 입력하세요'
                    placeholderTextColor='#888'
                    autoCapitalize='none'
                    autoFocus={false}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={addTodo}>
                    <Text style={styles.addButtonText}>추가</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.todoListContainer}>
                  {filteredTodos.length > 0 ? (
                    filteredTodos.map((todo) => (
                      <View key={todo.todo_id} style={styles.todoItem}>
                        <TouchableOpacity
                          style={[styles.checkbox, todo.completed && styles.checkboxChecked]}
                          onPress={() => handleToggleTodo(todo)}
                        >
                          {todo.completed && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                        <View style={styles.todoContent}>
                          <Text style={[styles.todoText, todo.completed && styles.todoTextCompleted]}>
                            {todo.content}
                          </Text>
                        </View>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTodo(todo.todo_id)}>
                          <Text style={styles.deleteButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyMessage}>할 일이 없습니다. 새로운 할 일을 추가해보세요!</Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.noDateSelectedContainer}>
                <Text style={styles.noDateSelectedText}>날짜를 선택하여 할 일을 관리하세요</Text>
              </View>
            )}
          </>

          {/* 하단 여백을 위한 빈 공간 */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  todoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: '100%',
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
    backgroundColor: '#FF8DA1',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
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
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
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
    fontSize: 12,
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
    color: '#888',
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
    height: 20,
    width: 20,
    borderRadius: 5,
    marginTop: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 30,
  },
});
