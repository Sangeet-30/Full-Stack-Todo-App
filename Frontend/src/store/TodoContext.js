import { createContext } from "react";

export const TodoContext = createContext({
  todoItems: [],
  addNewItem: () => {},
  deleteItem: () => {},
  toggleItem: () => {},
  editItem: () => {},
  clearCompleted: () => {},
});
