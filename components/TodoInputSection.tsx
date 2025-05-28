import React, { memo } from 'react';
import { View, TextInput, TouchableOpacity, Text, Keyboard, StyleSheet } from 'react-native';

export interface TodoInputSectionProps {
  newTodo: string;
  setNewTodo: (v: string) => void;
  addTodo: () => void;
  isLoading: boolean;
}

const TodoInputSection = memo(function TodoInputSection({
  newTodo,
  setNewTodo,
  addTodo,
  isLoading,
}: TodoInputSectionProps) {
  return (
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
        editable={!isLoading}
      />
      <TouchableOpacity style={styles.addButton} onPress={addTodo} disabled={isLoading}>
        <Text style={styles.addButtonText}>추가</Text>
      </TouchableOpacity>
    </View>
  );
});

export default TodoInputSection;

const styles = StyleSheet.create({
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
});
