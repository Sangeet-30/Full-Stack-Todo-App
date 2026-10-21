import { extractCalendarDate } from "../utils/dateUtils";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/todo"
).replace(/\/+$/, "");

const readResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `Server responded with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.message) {
        errorMessage = data.message;
      }
    } catch {
      // If response body is not JSON, retain default status message
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const mapServerItemToLocalItem = (serverItem) => {
  return {
    id: serverItem._id,
    name: serverItem.task,
    dueDate: extractCalendarDate(serverItem.date),
    completed: Boolean(serverItem.completed),
    createdAt: serverItem.createdAt,
    updatedAt: serverItem.updatedAt,
  };
};

export const getItemsFromServer = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    const items = await readResponse(response);
    return Array.isArray(items) ? items.map(mapServerItemToLocalItem) : [];
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to the backend server. Please verify the server is running.",
        { cause: err },
      );
    }
    throw err;
  }
};

export const addItemToServer = async (task, date) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: task.trim(),
        date,
      }),
    });
    const saved = await readResponse(response);
    return mapServerItemToLocalItem(saved);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Cannot connect to backend server to add task.", {
        cause: err,
      });
    }
    throw err;
  }
};

export const markItemCompletedOnServer = async (id, completed) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/completed`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed }),
    });
    const updated = await readResponse(response);
    return mapServerItemToLocalItem(updated);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to backend server to update task status.",
        { cause: err },
      );
    }
    throw err;
  }
};

export const updateTodoItemOnServer = async (id, task, date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: task.trim(),
        date,
      }),
    });
    const updated = await readResponse(response);
    return mapServerItemToLocalItem(updated);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Cannot connect to backend server to save task edits.", {
        cause: err,
      });
    }
    throw err;
  }
};

export const deleteItemFromServer = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
    await readResponse(response);
    return id;
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Cannot connect to backend server to delete task.", {
        cause: err,
      });
    }
    throw err;
  }
};

export const clearCompletedOnServer = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/completed`, {
      method: "DELETE",
    });
    await readResponse(response);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Cannot connect to backend server to clear tasks.", {
        cause: err,
      });
    }
    throw err;
  }
};
