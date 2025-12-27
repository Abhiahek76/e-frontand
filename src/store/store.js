import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import storeReducer from "./storSlice";
import cartReducer from "./cartSlice";
import paymentReducer from "./paymentSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    store: storeReducer,
    cart: cartReducer, // add this
    payment: paymentReducer,
  },
});
