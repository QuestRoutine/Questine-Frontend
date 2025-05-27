import axiosInstance from '@/api/axios';
import queryClient from '@/api/queryClient';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

interface AddTodoParams {
  content: string;
  due_at: string;
}

function useAddTodo(onSuccessCallback?: () => void) {
  const mutation = useMutation({
    mutationFn: async (params: AddTodoParams) => {
      const { content, due_at } = params;
      const { data } = await axiosInstance.post('/todo', {
        content,
        due_at,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '할 일을 추가하는 데 실패했습니다.',
      });
    },
  });

  return mutation;
}

export interface Todo {
  todo_id: number;
  content: string;
  completed: boolean;
  created_at: string;
  exp_reward: number;
  exp_shown?: boolean;
  due_at: string;
}

const TODOS_QUERY_KEY = ['todos'];

export function useTodos(): UseQueryResult<Todo[], Error> {
  const data = useQuery<Todo[], Error, Todo[], typeof TODOS_QUERY_KEY>({
    queryKey: TODOS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await axiosInstance.get('/todo');
      return data.map((item: any) => ({
        todo_id: item.todo_id,
        content: item.content,
        completed: item.completed,
        created_at: item.created_at.split('T')[0],
        exp_reward: item.exp_reward,
        exp_shown: item.completed,
        due_at: item.due_at.split('T')[0],
      }));
    },
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
export function useToggleTodoComplete() {
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
    // 낙관적 업데이트
    onMutate: async ({ todo_id, completed }) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY);

      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) =>
        old
          ? old.map((todo) =>
              todo.todo_id === todo_id ? { ...todo, completed, exp_shown: completed ? todo.exp_shown : true } : todo
            )
          : []
      );

      return { previousTodos };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
      }
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '할 일 완료 상태를 변경하는 데 실패했습니다.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
    },
  });
}

export function useDeleteTodo() {
  return useMutation({
    mutationFn: async (todo_id: number) => {
      await axiosInstance.delete(`/todo/${todo_id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      Toast.show({
        type: 'success',
        text1: '할 일 삭제',
        text2: '할 일이 성공적으로 삭제되었습니다.',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '할 일을 삭제하는 데 실패했습니다.',
      });
    },
  });
}

export { useAddTodo };
