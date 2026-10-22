import { useEffect, useReducer, useState, useCallback } from "react";
import {
  addItemToServer,
  clearCompletedOnServer,
  deleteItemFromServer,
  getItemsFromServer,
  markItemCompletedOnServer,
  updateTodoItemOnServer,
} from "../services/itemsService";
import { TodoContext } from "./TodoContext";
import { useAuth } from "./AuthContext";

const todoItemsReducer = (currTodoItems, action) => {
  switch (action.type) {
    case "SET_ITEMS":
      return action.payload.items;

    case "ADD_ITEM":
      return [action.payload.item, ...currTodoItems];

    case "DELETE_ITEM":
      return currTodoItems.filter((item) => item.id !== action.payload.itemId);

    case "TOGGLE_ITEM":
      return currTodoItems.map((item) =>
        item.id === action.payload.itemId
          ? { ...item, completed: !item.completed }
          : item,
      );

    case "EDIT_ITEM":
      return currTodoItems.map((item) =>
        item.id === action.payload.itemId
          ? {
              ...item,
              name: action.payload.itemName,
              dueDate: action.payload.itemDate,
            }
          : item,
      );

    case "CLEAR_COMPLETED":
      return currTodoItems.filter((item) => !item.completed);

    default:
      return currTodoItems;
  }
};

const TodoContextProvider = ({ children }) => {
  const { user, logout } = useAuth();
  const [todoItems, dispatchTodoItems] = useReducer(todoItemsReducer, []);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAuthExpiry = useCallback(
    (err) => {
      if (err.status === 401) {
        logout();
        setError("Your session has expired. Please sign in again.");
      } else {
        setError(err.message || "Operation failed.");
      }
    },
    [logout],
  );

  useEffect(() => {
    let ignore = false;

    if (!user) {
      return () => {
        ignore = true;
      };
    }

    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await getItemsFromServer();
        if (!ignore) {
          dispatchTodoItems({
            type: "SET_ITEMS",
            payload: { items },
          });
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load todo items:", err);
          handleAuthExpiry(err);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      ignore = true;
    };
  }, [user, handleAuthExpiry]);

  const refreshItems = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const items = await getItemsFromServer();
      dispatchTodoItems({
        type: "SET_ITEMS",
        payload: { items },
      });
    } catch (err) {
      console.error("Failed to refresh todo items:", err);
      handleAuthExpiry(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, handleAuthExpiry]);

  const addNewItem = async (itemName, itemDate) => {
    setIsMutating(true);
    setError(null);
    try {
      const item = await addItemToServer(itemName, itemDate);
      dispatchTodoItems({
        type: "ADD_ITEM",
        payload: { item },
      });
      showSuccess("Task added successfully!");
      return true;
    } catch (err) {
      console.error("Failed to add todo item:", err);
      handleAuthExpiry(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteItem = async (itemId) => {
    setIsMutating(true);
    setError(null);
    try {
      await deleteItemFromServer(itemId);
      dispatchTodoItems({
        type: "DELETE_ITEM",
        payload: { itemId },
      });
      showSuccess("Task deleted.");
      return true;
    } catch (err) {
      console.error("Failed to delete todo item:", err);
      handleAuthExpiry(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const toggleItem = async (itemId) => {
    const currentItem = todoItems.find((item) => item.id === itemId);
    if (!currentItem) return false;

    const nextCompletedState = !currentItem.completed;
    setError(null);

    // Optimistic toggle
    dispatchTodoItems({
      type: "TOGGLE_ITEM",
      payload: { itemId },
    });

    try {
      await markItemCompletedOnServer(itemId, nextCompletedState);
      return true;
    } catch (err) {
      console.error("Failed to update todo completion:", err);
      // Rollback on failure
      dispatchTodoItems({
        type: "TOGGLE_ITEM",
        payload: { itemId },
      });
      handleAuthExpiry(err);
      return false;
    }
  };

  const editItem = async (itemId, itemName, itemDate) => {
    setIsMutating(true);
    setError(null);
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
      showSuccess("Task updated successfully!");
      return true;
    } catch (err) {
      console.error("Failed to edit todo item:", err);
      handleAuthExpiry(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const clearCompleted = async () => {
    setIsMutating(true);
    setError(null);
    try {
      await clearCompletedOnServer();
      dispatchTodoItems({
        type: "CLEAR_COMPLETED",
      });
      showSuccess("Completed tasks cleared.");
      return true;
    } catch (err) {
      console.error("Failed to clear completed todo items:", err);
      handleAuthExpiry(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <TodoContext.Provider
      value={{
        todoItems,
        isLoading,
        isMutating,
        error,
        successMessage,
        addNewItem,
        deleteItem,
        toggleItem,
        editItem,
        clearCompleted,
        clearError,
        refreshItems,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export default TodoContextProvider;
