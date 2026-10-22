import { extractCalendarDate } from "../utils/dateUtils";

const getApiBaseUrl = () => {
  const envApi =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL;
  if (envApi) {
    return envApi.replace(/\/+$/, "");
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.PROD) {
    throw new Error(
      "Missing API configuration: VITE_API_BASE_URL is required in production.",
    );
  }
  return "http://localhost:3000/api/todo";
};

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
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
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
    const baseUrl = getApiBaseUrl();
    const response = await fetch(baseUrl, {
      credentials: "include",
    });
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
    const baseUrl = getApiBaseUrl();
    const response = await fetch(baseUrl, {
      method: "POST",
      credentials: "include",
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
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/${id}/completed`, {
      method: "PUT",
      credentials: "include",
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
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/${id}`, {
      method: "PATCH",
      credentials: "include",
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
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/${id}`, {
      method: "DELETE",
      credentials: "include",
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
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/completed`, {
      method: "DELETE",
      credentials: "include",
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
