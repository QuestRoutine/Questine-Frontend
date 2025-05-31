import axiosInstance from '@/api/axios';
import queryClient from '@/api/queryClient';
import { QuestineColors } from '@/constants/Colors';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { loadTodosStorage, saveTodosStorage } from './useTodoStorage';

interface AddTodoParams {
  content: string;
  due_at: string;
}

interface Todo {
  todo_id: number;
  content: string;
  completed: boolean;
  created_at: string;
  exp_reward: number;
  due_at: string;
}

const getTodosQueryKey = (year: number, month: number) => ['todos', year, month] as const;
export const DATE_FORMAT = 'YYYY-MM-DD';
const now = dayjs();

function getTodosStorageKey(year: number, month: number) {
  return `todos-${year}-${month}`;
}

function useAddTodo(year?: number, month?: number, onSuccessCallback?: () => void) {
  const queryYear = year ?? now.year();
  const queryMonth = month ?? now.month() + 1;
  const queryKey = getTodosQueryKey(queryYear, queryMonth);
  const storageKey = getTodosStorageKey(queryYear, queryMonth);

  const mutation = useMutation({
    mutationFn: async (params: AddTodoParams) => {
      const { content, due_at } = params;
      const { data } = await axiosInstance.post('/todo', {
        content,
        due_at,
      });
      return data;
    },
    onMutate: async (newTodoParams: AddTodoParams) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTodos = queryClient.getQueryData<Todo[]>(queryKey) ?? [];

      // 임시 ID
      const tempId = Date.now();
      const optimisticTodo: Todo = {
        todo_id: tempId,
        content: newTodoParams.content,
        completed: false,
        created_at: dayjs().format(DATE_FORMAT),
        exp_reward: 0,
        due_at: dayjs(newTodoParams.due_at).format(DATE_FORMAT),
      };

      const newTodos = [...previousTodos, optimisticTodo];
      queryClient.setQueryData<Todo[]>(queryKey, newTodos);
      await saveTodosStorage(storageKey, newTodos);

      return { previousTodos };
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: async (error, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos);
        await saveTodosStorage(storageKey, context.previousTodos);
      }
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '할 일을 추가하는 데 실패했습니다.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return mutation;
}

// 할 일 목록 조회
export function useTodos(year?: number, month?: number): UseQueryResult<Todo[], Error> {
  const queryYear = year ?? now.year();
  const queryMonth = month ?? now.month() + 1;
  const storageKey = getTodosStorageKey(queryYear, queryMonth);

  const data = useQuery<Todo[], Error, Todo[], any>({
    queryKey: getTodosQueryKey(queryYear, queryMonth),
    queryFn: async () => {
      // 로컬 스토리지
      const localTodosRaw = (await loadTodosStorage(storageKey)) ?? [];
      const localTodos = localTodosRaw.map((item: Todo) => ({
        ...item,
        due_at: dayjs(item.due_at).format(DATE_FORMAT),
      }));

      const { data } = await axiosInstance.get('/todo', {
        params: {
          year: queryYear,
          month: queryMonth,
        },
      });
      const serverTodos = data.map((item: Todo) => ({
        todo_id: item.todo_id,
        content: item.content,
        completed: item.completed,
        created_at: dayjs(item.created_at).format(DATE_FORMAT),
        exp_reward: item.exp_reward,
        due_at: dayjs(item.due_at).format(DATE_FORMAT),
      }));
      await saveTodosStorage(storageKey, serverTodos);
      return serverTodos.length > 0 ? serverTodos : localTodos;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    initialData: [],
  });
  useEffect(() => {
    if (data.error) {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '할 일을 불러오는 데 실패했습니다.',
      });
    }
  }, [data.error]);
  return data;
}

// 할 일 완료/미완료 토글 (스토리지 동기화)
export function useToggleTodoComplete(year?: number, month?: number) {
  const queryYear = year ?? now.year();
  const queryMonth = month ?? now.month() + 1;
  const queryKey = getTodosQueryKey(queryYear, queryMonth);
  const storageKey = getTodosStorageKey(queryYear, queryMonth);

  return useMutation({
    mutationFn: async ({ todo_id, completed, content }: { todo_id: number; completed: boolean; content: string }) => {
      if (completed) {
        // 완료 처리
        return axiosInstance.post(`/todo/done/${todo_id}`, null);
      } else {
        // 미완료 처리
        return axiosInstance.put(`/todo/${todo_id}`, { completed, content });
      }
    },
    onMutate: async ({ todo_id, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTodos = queryClient.getQueryData<Todo[]>(queryKey) ?? [];
      const newTodos = previousTodos.map((todo) => (todo.todo_id === todo_id ? { ...todo, completed } : todo));
      queryClient.setQueryData<Todo[]>(queryKey, newTodos);
      await saveTodosStorage(storageKey, newTodos);
      return { previousTodos };
    },
    onError: async (err: AxiosError, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos);
        await saveTodosStorage(storageKey, context.previousTodos);
      }
      const errorData = err.response?.data as { message?: string; cheatingDetected?: boolean } | undefined;
      if (errorData) {
        Toast.show({
          type: 'error',
          text1: '오류',
          text2: `${errorData.message || '할 일을 업데이트하는 데 실패했습니다.'}`,
          props: {
            icon: require('@/assets/sword.png'),
            color: QuestineColors.RED_300,
          },
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDeleteTodo(year?: number, month?: number) {
  const queryYear = year ?? now.year();
  const queryMonth = month ?? now.month() + 1;
  const queryKey = getTodosQueryKey(queryYear, queryMonth);
  const storageKey = getTodosStorageKey(queryYear, queryMonth);

  return useMutation({
    mutationFn: async (todo_id: number) => {
      await axiosInstance.delete(`/todo/${todo_id}`);
    },
    onMutate: async (todo_id: number) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTodos = queryClient.getQueryData<Todo[]>(queryKey) ?? [];
      const newTodos = previousTodos.filter((todo) => todo.todo_id !== todo_id);
      queryClient.setQueryData<Todo[]>(queryKey, newTodos);
      await saveTodosStorage(storageKey, newTodos);
      return { previousTodos };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: async (_err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos);
        await saveTodosStorage(storageKey, context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export { useAddTodo };
