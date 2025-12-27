import React, { createContext, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginThunk,
  registerThunk,
  logout as logoutAction,
  clearAuthError,
} from "";
// 🔁 path ঠিক করে দিন: "../store/authSlice" etc.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();

  const { user, token, isLoading, error } = useSelector((state) => state.auth);

  const isAuthenticated = !!token; // আপনার slice অনুযায়ী best

  // login wrapper
  const login = async ({ email, password, rememberMe = true }) => {
    const action = await dispatch(loginThunk({ email, password, rememberMe }));
    // unwrap না করলে caller চাইলে action.meta দেখে নিতে পারে
    return action;
  };

  // register wrapper
  const register = async ({ name, email, password, rememberMe = true }) => {
    const action = await dispatch(
      registerThunk({ name, email, password, rememberMe })
    );
    return action;
  };

  // logout wrapper
  const logout = () => {
    dispatch(logoutAction());
  };

  const clearError = () => {
    dispatch(clearAuthError());
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, token, isAuthenticated, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
