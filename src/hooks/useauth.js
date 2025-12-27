import { useDispatch, useSelector } from "react-redux";
import {
  loginThunk,
  registerThunk,
  logout as logoutAction,
  clearAuthError,
} from "../store/authSlice"; //
export default function useAuth() {
  const dispatch = useDispatch();
  const { user, token, isLoading, error } = useSelector((state) => state.auth);

  const isAuthenticated = !!token;

  const login = (payload) => dispatch(loginThunk(payload)).unwrap();
  const register = (payload) => dispatch(registerThunk(payload)).unwrap();
  const logout = () => dispatch(logoutAction());
  const clearError = () => dispatch(clearAuthError());

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
