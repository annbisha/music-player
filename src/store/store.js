import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../services/apiSlice";
import rootReducer from "./reducers";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;
