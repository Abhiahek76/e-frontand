// src/store/paymentSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./axios";

export const createRazorpayOrder = createAsyncThunk(
  "payment/createRazorpayOrder",
  async (
    { amount, currency, receipt, notes, shippingAddress },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/api/payments/razorpay/create-order", {
        amount,
        currency,
        receipt,
        notes,
        shippingAddress,
      });
      // expected: { key, order, dbOrderId? }
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || "Order create failed"
      );
    }
  }
);

export const verifyRazorpayPayment = createAsyncThunk(
  "payment/verifyRazorpayPayment",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/payments/razorpay/verify", payload);
      // expected: { success: true }
      if (!data?.success) {
        return rejectWithValue(data?.error || "Verification failed");
      }
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || "Verification failed"
      );
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    creatingOrder: false,
    verifying: false,
    error: null,
  },
  reducers: {
    clearPaymentError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRazorpayOrder.pending, (state) => {
        state.creatingOrder = true;
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state) => {
        state.creatingOrder = false;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.creatingOrder = false;
        state.error = action.payload || "Order create failed";
      })

      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.verifying = true;
        state.error = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state) => {
        state.verifying = false;
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.verifying = false;
        state.error = action.payload || "Verification failed";
      });
  },
});

export const { clearPaymentError } = paymentSlice.actions;

export const selectCreatingOrder = (s) => s.payment.creatingOrder;
export const selectVerifying = (s) => s.payment.verifying;
export const selectPaymentError = (s) => s.payment.error;

export default paymentSlice.reducer;
