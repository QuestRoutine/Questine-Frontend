import { useState, useEffect } from 'react';
import { Text, SafeAreaView, View, Pressable, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { CalendarList, DateData, LocaleConfig } from 'react-native-calendars';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';

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

const COLORS = ['#FFB6C1', '#B5EAD7', '#C7CEEA', '#FFDAC1', '#E2F0CB'];

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  expReward: number;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  // const colors = Colors[colorScheme ?? 'light'];
  const colors = Colors['light'];

  const [selected, setSelected] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [currentMonth, setCurrentMonth] = useState(today);
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: '오전 회의 참석하기', completed: false, date: '2025-05-01', expReward: 10 },
    { id: '2', text: '운동 30분 하기', completed: true, date: '2025-05-01', expReward: 5 },
    { id: '3', text: '쇼핑몰 주문하기', completed: false, date: '2025-05-03', expReward: 5 },
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  // 할 일 목록에 따라 날짜 마커 초기화
  useEffect(() => {
    updateAllMarkedDates();
  }, [todos]);

  // 모든 날짜의 마커를 할 일 목록에 맞게 업데이트
  const updateAllMarkedDates = () => {
    const newMarkedDates: MarkedDates = {};

    // 중복 없이 모든 할 일 날짜 추출
    const uniqueDates = [...new Set(todos.map((todo) => todo.date))];

    uniqueDates.forEach((date) => {
      const dayTodos = todos.filter((todo) => todo.date === date);
      const completedTodos = dayTodos.filter((todo) => todo.completed);
      const incompleteTodos = dayTodos.filter((todo) => !todo.completed);

      if (dayTodos.length === 0) {
        // 할 일이 없는 경우 표시 안함
        return;
      } else if (completedTodos.length === 0) {
        // 할 일은 있지만 모두 미완료인 경우
        newMarkedDates[date] = {
          marked: true,
          dots: [],
          todoCount: dayTodos.length,
        };
      } else {
        // 완료된 할 일이 있는 경우
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

  // 캘린더 로케일(kr) 설정
  LocaleConfig.locales.kr = {
    monthNames: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월'],
    monthNamesShort: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  };
  LocaleConfig.defaultLocale = 'kr';

  // 날짜 누를 시, 호출되는 함수
  const onDayPress = (day: DateData) => {
    // 이전에 선택된 날짜와 새로 선택된 날짜가 다른 경우에만 색상 변경
    if (selected !== day.dateString) {
      const selectedColor = COLORS[0];
      console.log('onDayPress ', day.dateString);
      setSelected(day.dateString);
      console.log('날짜 선택됨:', day.dateString, '색상:', selectedColor);
    }
  };

  // 월 변경 시, 호출되는 함수
  const onMonthChange = (month: DateData) => {
    console.log('Month changed:', month);
    const newMonth = `${month.year}-${month.month < 10 ? '0' + month.month : month.month}-01`;
    console.log('New month string:', newMonth);
    setCurrentMonth(newMonth);
  };

  // 할 일 추가
  const addTodo = () => {
    if (newTodo.trim() && selected) {
      const newTodoItem: Todo = {
        id: Date.now().toString(),
        text: newTodo,
        completed: false,
        date: selected,
        expReward: 0,
      };
      setTodos([...todos, newTodoItem]);
      setNewTodo('');
      console.log('할일추가');

      updateMarkedDate(selected);
    }
  };

  // 마킹된 날짜 업데이트
  const updateMarkedDate = (date: string) => {
    if (!markedDates[date]) {
      const colorIndex = Math.floor(Math.random() * COLORS.length);
      const selectedColor = COLORS[colorIndex];

      setMarkedDates({
        ...markedDates,
        [date]: {
          marked: true,
          dots: [{ color: selectedColor }],
        },
      });
    }
  };

  const showToast = (earnedExp: number) => {
    Toast.show({
      type: 'success',
      text1: '알림',
      text2: `+${earnedExp} XP를 획득했습니다!👋`,
    });
  };

  // 할 일 완료 및 경험치 획득
  const toggleTodoComplete = (id: string) => {
    const todoToToggle = todos.find((todo) => todo.id === id);
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    setTodos(updatedTodos);

    // 할 일을 완료한 경우
    if (todoToToggle && !todoToToggle.completed) {
      // 기본 경험치 획득
      let earnedExp = todoToToggle.expReward;

      // 완료 토스트
      showToast(earnedExp);
    }
  };

  // 할 일 삭제
  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);

    const selectedDateTodos = updatedTodos.filter((todo) => todo.date === selected);
    if (selectedDateTodos.length === 0) {
      const updatedMarkedDates = { ...markedDates };
      if (updatedMarkedDates[selected]) {
        delete updatedMarkedDates[selected];
        setMarkedDates(updatedMarkedDates);
      }
    }
  };

  const filteredTodos = todos.filter((todo) => todo.date === selected);

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
        } else if (dots.length > 1) {
          // 완료된 할일이 여러 개인 경우 분할 색상 효과 적용
          // 그라데이션 대신 색상 분할 방식으로 구현
          dayBackgroundStyle = {
            backgroundColor: 'transparent', // 배경색 투명하게 설정
            borderWidth: 0, // 기존 테두리 제거
          };

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

              <View style={styles.splitColorContainer}>
                {dots.map((dot: { color: string }, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.splitColorSection,
                      {
                        backgroundColor: dot.color,
                        width: `${100 / dots.length}%`,
                        left: `${(100 / dots.length) * index}%`,
                      },
                    ]}
                  />
                ))}

                {/* 미완료 할일 카운트가 있는 경우 표시 */}
                {incompleteTodoCount > 0 && <Text style={styles.todoCountText}>{incompleteTodoCount}</Text>}
              </View>
            </Pressable>
          );
        }

        // 미완료 할일이 있으면 카운트 표시
        if (incompleteTodoCount > 0) {
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background || '#FFF' }}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Qustine</Text>
        <CalendarList
          style={styles.calendar}
          onDayPress={onDayPress}
          horizontal
          pagingEnabled
          onMonthChange={onMonthChange}
          markedDates={markedDates}
          dayComponent={dayComponent}
          calendarStyle={styles.calendarStyle}
          hideArrows={false}
          renderHeader={(date) => {
            const dateObj = new Date(date);
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth() + 1;
            return (
              <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                {year}년 {month < 10 ? `0${month}` : month}월
              </Text>
            );
          }}
        />

        {selected ? (
          <View style={styles.todoSection}>
            <Text style={styles.selectedDateText}>{selected} 할 일</Text>

            <View style={styles.todoInputContainer}>
              <TextInput
                style={styles.todoInput}
                value={newTodo}
                onChangeText={setNewTodo}
                placeholder='새로운 할 일을 입력하세요'
                placeholderTextColor='#888'
              />
              <TouchableOpacity style={styles.addButton} onPress={addTodo}>
                <Text style={styles.addButtonText}>추가</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.todoListContainer}>
              {filteredTodos.length > 0 ? (
                filteredTodos.map((todo) => (
                  <View key={todo.id} style={styles.todoItem}>
                    {/* <Button title='Show toast' onPress={showToast} />; */}
                    <TouchableOpacity
                      style={[styles.checkbox, todo.completed && styles.checkboxChecked]}
                      onPress={() => toggleTodoComplete(todo.id)}
                    >
                      {todo.completed && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                    <View style={styles.todoContent}>
                      <Text style={[styles.todoText, todo.completed && styles.todoTextCompleted]}>{todo.text}</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTodo(todo.id)}>
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

        {/* 하단 여백을 위한 빈 공간 */}
        <View style={styles.bottomPadding} />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FF8DA1',
    textAlign: 'center',
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
    transform: [{ scale: 1.2 }],
  },
  todoCountText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  todoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
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
  legendContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  legendText: {
    fontSize: 12,
    marginBottom: 4,
    color: '#888',
  },
  colorLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  splitColorContainer: {
    position: 'relative',
    height: 20,
    width: 20,
    borderRadius: 5,
    marginTop: 4,
    overflow: 'hidden', // 분할된 색상이 컨테이너 영역을 벗어나지 않도록 설정
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitColorSection: {
    position: 'absolute',
    height: '100%',
    top: 0,
  },
  bottomPadding: {
    height: 30,
  },
});
