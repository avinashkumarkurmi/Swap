import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    // add more reducers here
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(myMiddleware), // optional
  // devTools: process.env.NODE_ENV !== 'production',
});

// export default store;
