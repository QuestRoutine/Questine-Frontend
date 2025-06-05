import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export async function saveTodosStorage(key: string, todos: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(todos));
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: '할 일 저장 실패',
      text2: '할 일을 저장하는 중 오류가 발생했습니다.',
    });
  }
}

export async function loadTodosStorage(key: string) {
  const value = await AsyncStorage.getItem(key);
  if (value !== null) {
    return JSON.parse(value);
  }
  return null;
}
