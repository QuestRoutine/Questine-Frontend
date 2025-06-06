import { QueryClient } from '@tanstack/react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 20, // 20s
    },
    mutations: {
      retry: false,
    },
  },
});

export default queryClient;
