const getAuthBaseUrl = () => {
  const envAuth =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_AUTH_BASE_URL;
  if (envAuth) {
    return envAuth.replace(/\/+$/, "");
  }
  const envApi =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL;
  if (envApi) {
    return envApi.replace(/\/todo\/?$/, "/auth").replace(/\/+$/, "");
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.PROD) {
    throw new Error(
      "Missing API configuration: VITE_AUTH_BASE_URL or VITE_API_BASE_URL is required in production.",
    );
  }
  return "http://localhost:3000/api/auth";
};

const readResponse = async (response) => {
  let errorMessage = `Server responded with status ${response.status}`;
  let data = null;

  try {
    data = await response.json();
    if (data) {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        errorMessage = data.errors.join(", ");
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    }
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const register = async (name, email, password, passwordConfirmation) => {
  try {
    const baseUrl = getAuthBaseUrl();
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        passwordConfirmation,
      }),
    });
    return await readResponse(response);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to the authentication server. Please verify the server is running.",
        { cause: err },
      );
    }
    throw err;
  }
};

export const login = async (email, password) => {
  try {
    const baseUrl = getAuthBaseUrl();
    const response = await fetch(`${baseUrl}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    return await readResponse(response);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to the authentication server. Please verify the server is running.",
        { cause: err },
      );
    }
    throw err;
  }
};

export const logout = async () => {
  try {
    const baseUrl = getAuthBaseUrl();
    const response = await fetch(`${baseUrl}/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await readResponse(response);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to the authentication server.",
        { cause: err },
      );
    }
    throw err;
  }
};

export const getMe = async () => {
  try {
    const baseUrl = getAuthBaseUrl();
    const response = await fetch(`${baseUrl}/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await readResponse(response);
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to the authentication server.",
        { cause: err },
      );
    }
    throw err;
  }
};
