import { combineReducers } from "@reduxjs/toolkit";
import playerReducer from "./playerReducer";
import { apiSlice } from "../../services/apiSlice";
import authReducer from "../../services/authSlice";

const appReducer = combineReducers({
  player: playerReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "RESET_STORE") {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
