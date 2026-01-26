import { configureStore } from "@reduxjs/toolkit";
import driverReducer from "./drivers/driverSlice.js";

const store = configureStore({
  reducer: {
    drivers: driverReducer,
  },
});

export default store;
