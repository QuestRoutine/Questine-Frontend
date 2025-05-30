import axiosInstance from '@/api/axios';
import queryClient from '@/api/queryClient';
import { QuestineColors } from '@/constants/Colors';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

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

function useAddTodo(year?: number, month?: number, onSuccessCallback?: () => void) {
  const queryYear = year ?? now.year();
  const queryMonth = month ?? now.month() + 1;
  const queryKey = getTodosQueryKey(queryYear, queryMonth);

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
      const previousTodos = queryClient.getQueryData<Todo[]>(queryKey);

      // 임시 ID
      const tempId = Date.now();

      queryClient.setQueryData<Todo[]>(queryKey, (old = []) => [
        ...old,
        {
          todo_id: tempId,
          content: newTodoParams.content,
          completed: false,
          created_at: dayjs().format(DATE_FORMAT),
          exp_reward: 0,
          due_at: newTodoParams.due_at,
        },
      ]);

      return { previousTodos };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos);
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

  const data = useQuery<Todo[], Error, Todo[], any>({
    queryKey: getTodosQueryKey(queryYear, queryMonth),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/todo', {
        params: {
          year: queryYear,
          month: queryMonth,
        },
      });
      return data.map((item: Todo) => ({
        todo_id: item.todo_id,
        content: item.content,
        completed: item.completed,
        created_at: dayjs(item.created_at).format(DATE_FORMAT),
        exp_reward: item.exp_reward,
        due_at: dayjs(item.due_at),
      }));
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
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

// 할 일 완료/미완료 토글 (낙관적 업데이트)
export function useToggleTodoComplete(year?: number, month?: number) {
  const queryYear = year ?? now.year();
  const queryMonth = month ?? now.month() + 1;
  const queryKey = getTodosQueryKey(queryYear, queryMonth);

  return useMutation({
    mutationFn: async ({ todo_id, completed }: { todo_id: number; completed: boolean }) => {
      if (completed) {
        // 완료 처리
        return axiosInstance.post(`/todo/done/${todo_id}`, null);
      } else {
        // 미완료 처리
        return axiosInstance.put(`/todo/${todo_id}`, { completed });
      }
    },

    // optimistic
    onMutate: async ({ todo_id, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTodos = queryClient.getQueryData<Todo[]>(queryKey);

      queryClient.setQueryData<Todo[]>(queryKey, (old) =>
        old
          ? old.map((todo) => {
              if (todo.todo_id !== todo_id) return todo;
              const newCompleted = completed;
              return {
                ...todo,
                completed: newCompleted,
              };
            })
          : []
      );

      return { previousTodos };
    },

    onError: (err: AxiosError, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos);
      }
      const errorData = err.response?.data as { message?: string; cheatingDetected?: boolean } | undefined;

      if (errorData) {
        Toast.show({
          type: 'custom',
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

  return useMutation({
    mutationFn: async (todo_id: number) => {
      await axiosInstance.delete(`/todo/${todo_id}`);
    },
    onMutate: async (todo_id: number) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTodos = queryClient.getQueryData<Todo[]>(queryKey);

      queryClient.setQueryData<Todo[]>(queryKey, (old = []) => old.filter((todo) => todo.todo_id !== todo_id));

      return { previousTodos };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export { useAddTodo };
