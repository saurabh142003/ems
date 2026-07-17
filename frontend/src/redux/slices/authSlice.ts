import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, Employee } from "../../types";

const token = localStorage.getItem("token");
const userJson = localStorage.getItem("user");
let user: Employee | null = null;

if (userJson) {
  try {
    user = JSON.parse(userJson);
  } catch (e) {
    localStorage.removeItem("user");
  }
}

const initialState: AuthState = {
  token,
  user,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(
      state,
      action: PayloadAction<{ token: string; user: Employee }>,
    ) {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = action.payload;
    },
    logout(state) {
      state.loading = false;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    updateProfileSuccess(state, action: PayloadAction<Employee>) {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfileSuccess,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
