export type AddTodoParams = {
  content: string;
  due_at: string;
};

export type Todo = {
  todo_id: number;
  content: string;
  completed: boolean;
  created_at: string;
  exp_reward: number;
  due_at: string;
};

export type TodoListProps = {
  filteredTodos: Todo[];
  handleToggleTodo: (todo: Todo) => void;
  deleteTodo: (id: number) => void;
};

export type TodoInputSectionProps = {
  addTodo: (todo: string) => void;
  isLoading: boolean;
};
