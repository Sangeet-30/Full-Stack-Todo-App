export const addItemToServer = async (task, date) => {
  const response = await fetch("http://localhost:3000/api/todo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task, date }),
  });
  return mapServerItemToLocalItem(await readResponse(response));
};

export const getItemsFromServer = async () => {
  const response = await fetch("http://localhost:3000/api/todo");
  const items = await readResponse(response);
  return items.map(mapServerItemToLocalItem);
};

export const markItemCompletedOnServer = async (id, completed) => {
  const response = await fetch(
    `http://localhost:3000/api/todo/${id}/completed`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    },
  );
  return mapServerItemToLocalItem(await readResponse(response));
};

export const updateTodoItemOnServer = async (id, task, date) => {
  const response = await fetch(`http://localhost:3000/api/todo/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, date }),
  });
  return mapServerItemToLocalItem(await readResponse(response));
};

export const deleteItemFromServer = async (id) => {
  const response = await fetch(`http://localhost:3000/api/todo/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return id;
};

export const clearCompletedOnServer = async () => {
  const response = await fetch("http://localhost:3000/api/todo/completed", {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
};

const readResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
};

const mapServerItemToLocalItem = (serverItem) => {
  return {
    id: serverItem._id,
    name: serverItem.task,
    dueDate: serverItem.date ? serverItem.date.slice(0, 10) : "",
    completed: serverItem.completed,
    createdAt: serverItem.createdAt,
    updatedAt: serverItem.updatedAt,
  };
};
