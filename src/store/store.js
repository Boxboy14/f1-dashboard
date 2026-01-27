import { configureStore } from "@reduxjs/toolkit";
import driverReducer from "./drivers/driverSlice.js";

const store = configureStore({
  reducer: {
    Drivers: driverReducer,
  },
});

window.getState = () => store.getState();

export default store;
