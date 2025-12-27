import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./axios";
const CART_BASE = "/api/cart";
/* -------------------- guestKey helpers -------------------- */
const GUEST_KEY_STORAGE = "guestKey";
const loadGuestKey = () => {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(GUEST_KEY_STORAGE);
  } catch {
    return null;
  }
};

const saveGuestKey = (key) => {
  try {
    if (typeof window === "undefined") return;
    if (!key) localStorage.removeItem(GUEST_KEY_STORAGE);
    else localStorage.setItem(GUEST_KEY_STORAGE, key);
  } catch {
    // ignore
  }
};

const withGuestHeader = (getState) => {
  const state = getState?.();
  const key = state?.cart?.guestKey || loadGuestKey();
  return key ? { headers: { "x-guest-key": key } } : {};
};

/* -------------------- Thunks -------------------- */

// GET /api/cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const config = withGuestHeader(thunkAPI.getState);
      const res = await api.get(CART_BASE, config);
      // res.data => { data: cartOrNull, guestKey? }
      console.log(res.data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);

// POST /api/cart/items  body: { variantId, quantity }
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ variantId, quantity = 1 }, thunkAPI) => {
    try {
      const config = withGuestHeader(thunkAPI.getState);
      const res = await api.post(
        `${CART_BASE}/items`,
        { variantId, quantity },
        config
      );
      return res.data; // { data, guestKey? }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);

// PATCH /api/cart/items/:itemId  body: { quantity }
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, thunkAPI) => {
    try {
      const config = withGuestHeader(thunkAPI.getState);
      const res = await api.patch(
        `${CART_BASE}/items/${itemId}`,
        { quantity },
        config
      );
      return res.data; // { data }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);

// DELETE /api/cart/items/:itemId
export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async ({ itemId }, thunkAPI) => {
    try {
      const config = withGuestHeader(thunkAPI.getState);
      const res = await api.delete(`${CART_BASE}/items/${itemId}`, config);
      return res.data; // { data }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);

// DELETE /api/cart  (clear all items)
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, thunkAPI) => {
    try {
      const config = withGuestHeader(thunkAPI.getState);
      const res = await api.delete(CART_BASE, config);
      return res.data; // { data }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);

// POST /api/cart/merge
export const mergeGuestCart = createAsyncThunk(
  "cart/mergeGuestCart",
  async (_, thunkAPI) => {
    try {
      const config = withGuestHeader(thunkAPI.getState);
      const res = await api.post(`${CART_BASE}/merge`, {}, config);
      return res.data; // { data }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);

/* -------------------- Slice -------------------- */
const initialState = {
  cart: null, // hydrated cart
  guestKey: loadGuestKey(),
  status: "idle", // idle | loading | succeeded | failed
  actionStatus: "idle",
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setGuestKey(state, action) {
      state.guestKey = action.payload || null;
      saveGuestKey(state.guestKey);
    },
    clearCartState(state) {
      state.cart = null;
      state.status = "idle";
      state.actionStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchCart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cart = action.payload?.data ?? null;

        const gk = action.payload?.guestKey ?? null;
        if (gk) {
          state.guestKey = gk;
          saveGuestKey(gk);
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error?.message;
      });

    // Common handler for mutating actions (add/update/remove/clear/merge)
    const pending = (state) => {
      state.actionStatus = "loading";
      state.error = null;
    };
    const fulfilled = (state, action) => {
      state.actionStatus = "succeeded";
      state.cart = action.payload?.data ?? state.cart ?? null;

      const gk = action.payload?.guestKey ?? null;
      // guest addToCart/getCart এ guestKey আসতে পারে
      if (gk) {
        state.guestKey = gk;
        saveGuestKey(gk);
      }
    };
    const rejected = (state, action) => {
      state.actionStatus = "failed";
      state.error = action.payload?.message || action.error?.message;
    };

    builder
      .addCase(addToCart.pending, pending)
      .addCase(addToCart.fulfilled, fulfilled)
      .addCase(addToCart.rejected, rejected)

      .addCase(updateCartItem.pending, pending)
      .addCase(updateCartItem.fulfilled, fulfilled)
      .addCase(updateCartItem.rejected, rejected)

      .addCase(removeCartItem.pending, pending)
      .addCase(removeCartItem.fulfilled, fulfilled)
      .addCase(removeCartItem.rejected, rejected)

      .addCase(clearCart.pending, pending)
      .addCase(clearCart.fulfilled, fulfilled)
      .addCase(clearCart.rejected, rejected)

      .addCase(mergeGuestCart.pending, pending)
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        // merge শেষে সাধারণত user cart হবে; guestKey চাইলে clear করে দিতে পারো
        state.actionStatus = "succeeded";
        state.cart = action.payload?.data ?? null;

        // merge successful হলে guestKey remove করা convenient
        state.guestKey = null;
        saveGuestKey(null);
      })
      .addCase(mergeGuestCart.rejected, rejected);
  },
});

export const { setGuestKey, clearCartState } = cartSlice.actions;

export const selectCart = (state) => state.cart.cart;
export const selectCartSubtotal = (state) =>
  state.cart.cart?.computed?.subtotal ?? 0;
export const selectCartItems = (state) => state.cart.cart?.items ?? [];
export const selectCartLoading = (state) =>
  state.cart.status === "loading" || state.cart.actionStatus === "loading";
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
