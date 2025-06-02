import { QuestineColors } from '@/constants/Colors';
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Todo {
  todo_id: number;
  content: string;
  completed: boolean;
  created_at: string;
  exp_reward: number;
  exp_shown?: boolean;
  due_at: string;
}

interface TodoListProps {
  filteredTodos: Todo[];
  handleToggleTodo: (todo: Todo) => void;
  deleteTodo: (id: number) => void;
}

const TodoList = memo(function TodoList({ filteredTodos, handleToggleTodo, deleteTodo }: TodoListProps) {
  return (
    <View style={styles.todoListContainer}>
      {filteredTodos.length > 0 ? (
        filteredTodos.map((todo) => (
          <View key={todo.todo_id} style={styles.todoItem}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.checkbox, todo.completed && styles.checkboxChecked]}
              onPress={() => handleToggleTodo(todo)}
            >
              {todo.completed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <View style={styles.todoContent}>
              <Text style={[styles.todoText, todo.completed && styles.todoTextCompleted]}>{todo.content}</Text>
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
  );
});

export default TodoList;

const styles = StyleSheet.create({
  todoListContainer: {
    marginTop: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    // paddingLeft: 8,
    // borderWidth: 1,
    borderBottomColor: QuestineColors.GRAY_200,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: QuestineColors.PINK_300,
    borderColor: QuestineColors.PINK_300,
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
});
