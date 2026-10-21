import { useEffect, useReducer } from "react";
import {
  addItemToServer,
  clearCompletedOnServer,
  deleteItemFromServer,
  getItemsFromServer,
  markItemCompletedOnServer,
  updateTodoItemOnServer,
} from "../services/itemsService";
import { TodoContext } from "./TodoContext";

const todoItemsReducer = (currTodoItems, action) => {
  if (action.type === "SET_ITEMS") {
    return action.payload.items;
  }

  if (action.type === "ADD_ITEM") {
    return [...currTodoItems, action.payload.item];
  }

  if (action.type === "DELETE_ITEM") {
    return currTodoItems.filter((item) => item.id !== action.payload.itemId);
  }

  if (action.type === "TOGGLE_ITEM") {
    return currTodoItems.map((item) =>
      item.id === action.payload.itemId
        ? { ...item, completed: !item.completed }
        : item,
    );
  }

  if (action.type === "EDIT_ITEM") {
    return currTodoItems.map((item) =>
      item.id === action.payload.itemId
        ? {
            ...item,
            name: action.payload.itemName,
            dueDate: action.payload.itemDate,
          }
        : item,
    );
  }

  if (action.type === "CLEAR_COMPLETED") {
    return currTodoItems.filter((item) => !item.completed);
  }

  return currTodoItems;
};

const TodoContextProvider = ({ children }) => {
  const [todoItems, dispatchTodoItems] = useReducer(todoItemsReducer, []);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await getItemsFromServer();
        dispatchTodoItems({
          type: "SET_ITEMS",
          payload: { items },
        });
      } catch (error) {
        console.error("Failed to load todo items:", error);
      }
    };

    loadItems();
  }, []);

  const addNewItem = async (itemName, itemDate) => {
    try {
      const item = await addItemToServer(itemName, itemDate);
      dispatchTodoItems({
        type: "ADD_ITEM",
        payload: {
          item,
        },
      });
    } catch (error) {
      console.error("Failed to add todo item:", error);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await deleteItemFromServer(itemId);
      dispatchTodoItems({
        type: "DELETE_ITEM",
        payload: { itemId },
      });
    } catch (error) {
      console.error("Failed to delete todo item:", error);
    }
  };

  const toggleItem = async (itemId) => {
    const currentItem = todoItems.find((item) => item.id === itemId);
    if (!currentItem) return;

    try {
      await markItemCompletedOnServer(itemId, !currentItem.completed);
      dispatchTodoItems({
        type: "TOGGLE_ITEM",
        payload: { itemId },
      });
    } catch (error) {
      console.error("Failed to update todo completion:", error);
    }
  };

  const editItem = async (itemId, itemName, itemDate) => {
    try {
      await updateTodoItemOnServer(itemId, itemName, itemDate);
      dispatchTodoItems({
        type: "EDIT_ITEM",
        payload: {
          itemId,
          itemName,
          itemDate,
        },
      });
    } catch (error) {
      console.error("Failed to edit todo item:", error);
    }
  };

  const clearCompleted = async () => {
    try {
      await clearCompletedOnServer();
      dispatchTodoItems({
        type: "CLEAR_COMPLETED",
      });
    } catch (error) {
      console.error("Failed to clear completed todo items:", error);
    }
  };

  return (
    <TodoContext.Provider
      value={{
        todoItems,
        addNewItem,
        deleteItem,
        toggleItem,
        editItem,
        clearCompleted,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export default TodoContextProvider;
