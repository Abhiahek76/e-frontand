import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, setAuthToken } from "./axios";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const loadAuth = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { token: token || null, user };
  } catch {
    return { token: null, user: null };
  }
};

const saveAuth = ({ token, user }, rememberMe) => {
  const storage = rememberMe ? localStorage : sessionStorage;

  if (token) storage.setItem(TOKEN_KEY, token);
  if (user) storage.setItem(USER_KEY, JSON.stringify(user));

  const other = rememberMe ? sessionStorage : localStorage;
  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
};

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

const getErrMsg = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  "Request failed";

export const registerThunk = createAsyncThunk(
  "auth/register",
  async ({ name, email, password, rememberMe = true }, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      const data = res.data; // { user, token }
      saveAuth({ token: data.token, user: data.user }, rememberMe);

      // token set for next requests
      setAuthToken(data.token);

      return data;
    } catch (err) {
      return rejectWithValue(getErrMsg(err));
    }
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password, rememberMe = true }, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });

      const data = res.data; // { user, token }
      saveAuth({ token: data.token, user: data.user }, rememberMe);

      //token set for next requests
      setAuthToken(data.token);

      return data;
    } catch (err) {
      return rejectWithValue(getErrMsg(err));
    }
  }
);

//  initial load: localStorage first, fallback to sessionStorage
const initial = loadAuth();
if (!initial.token) {
  initial.token = sessionStorage.getItem(TOKEN_KEY) || null;
  const userRaw = sessionStorage.getItem(USER_KEY);
  initial.user = initial.user || (userRaw ? JSON.parse(userRaw) : null);
}

// app start: set token into axios
setAuthToken(initial.token);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initial.user,
    token: initial.token,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      clearAuth();

      //  remove token from axios
      setAuthToken(null);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      })
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
