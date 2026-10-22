import { createContext, useContext } from "react";

export const AuthContext = createContext({
  user: null,
  isAuthLoading: true,
  authError: null,
  clearAuthError: () => {},
  login: async () => false,
  register: async () => false,
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;

