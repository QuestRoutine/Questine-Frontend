import { TodoInputSectionProps } from '@/types/todo';
import React, { memo, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Keyboard } from 'react-native';

const TodoInputSection = memo(function TodoInputSection({ addTodo, isLoading }: TodoInputSectionProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (!inputValue.trim()) {
      Keyboard.dismiss();
      return;
    }
    addTodo(inputValue);
    setInputValue('');
  };

  return (
    <View style={styles.todoInputContainer}>
      <TextInput
        style={styles.todoInput}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder='새로운 할 일을 입력하세요'
        placeholderTextColor='#888'
        autoCapitalize='none'
        autoFocus={false}
        onSubmitEditing={handleAdd}
        submitBehavior='submit'
        returnKeyType='done'
      />
      <TouchableOpacity
        style={[styles.addButton, isLoading && { opacity: 0.5 }]}
        onPress={handleAdd}
        disabled={isLoading}
      >
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
