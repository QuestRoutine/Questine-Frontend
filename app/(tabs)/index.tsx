import { useState } from 'react';
import { Text, SafeAreaView, View, Pressable, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { CalendarList, DateData, LocaleConfig } from 'react-native-calendars';

type MarkedDates = {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    selectedColor?: string;
    dots?: Array<{ color: string }>;
  };
};

const COLORS = ['#FFB6C1', '#B5EAD7', '#C7CEEA', '#FFDAC1', '#E2F0CB'];

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

export default function HomeScreen() {
  const [selected, setSelected] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [currentMonth, setCurrentMonth] = useState(today);
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: '오전 회의 참석하기', completed: false, date: '2025-04-01' },
    { id: '2', text: '운동 30분 하기', completed: true, date: '2025-04-01' },
    { id: '3', text: '쇼핑몰 주문하기', completed: false, date: '2025-04-03' },
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({
    '2025-04-01': {
      selected: true,
      marked: true,
      selectedColor: COLORS[0],
      dots: [{ color: COLORS[0] }],
    },
    '2025-04-02': { marked: true, dots: [{ color: COLORS[1] }] },
    '2025-04-03': {
      selected: true,
      marked: true,
      selectedColor: COLORS[2],
      dots: [{ color: COLORS[2] }],
    },
  });

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
    // month 객체는 year, month 속성을 가지고 있음
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
      };
      setTodos([...todos, newTodoItem]);
      setNewTodo('');

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

  // 할 일 완료
  const toggleTodoComplete = (id: string) => {
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    setTodos(updatedTodos);
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
        <Text
          style={[
            styles.dayText,
            state === 'disabled' ? styles.disabledText : null,
            marking?.selected ? styles.selectedDayText : null,
            date.dateString === selected ? styles.currentSelectedDay : null,
          ]}
        >
          {date.day}
        </Text>
        <View
          style={[
            styles.todoIndicator,
            marking?.selected ? { backgroundColor: marking.selectedColor || COLORS[0] } : null,
            date.dateString === selected ? { backgroundColor: '#FF8DA1', transform: [{ scale: 1.2 }] } : null,
          ]}
        />
      </Pressable>
    );
  };

  return (
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

          <ScrollView style={styles.todoList}>
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => (
                <View key={todo.id} style={styles.todoItem}>
                  <TouchableOpacity
                    style={[styles.checkbox, todo.completed && styles.checkboxChecked]}
                    onPress={() => toggleTodoComplete(todo.id)}
                  >
                    {todo.completed && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <Text style={[styles.todoText, todo.completed && styles.todoTextCompleted]}>{todo.text}</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTodo(todo.id)}>
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyMessage}>할 일이 없습니다. 새로운 할 일을 추가해보세요!</Text>
            )}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.noDateSelectedContainer}>
          <Text style={styles.noDateSelectedText}>날짜를 선택하여 할 일을 관리하세요</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
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
  dayText: {
    textAlign: 'center',
    fontSize: 14,
  },
  disabledText: {
    color: '#d9e1e8',
  },
  selectedDayText: {
    fontWeight: 'bold',
  },
  currentSelectedDay: {
    fontWeight: 'bold',
    color: '#FF8DA1',
  },
  todoIndicator: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginTop: 4,
  },
  todoSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8DA1',
    marginBottom: 10,
  },
  todoInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
  todoList: {
    flex: 1,
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
  todoText: {
    flex: 1,
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
});
