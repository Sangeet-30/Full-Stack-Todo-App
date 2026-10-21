import { createContext } from "react";

export const TodoContext = createContext({
  todoItems: [],
  isLoading: false,
  isMutating: false,
  error: null,
  successMessage: null,
  addNewItem: async () => false,
  deleteItem: async () => false,
  toggleItem: async () => false,
  editItem: async () => false,
  clearCompleted: async () => false,
  clearError: () => {},
  refreshItems: async () => {},
});
