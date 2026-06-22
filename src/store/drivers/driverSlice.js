import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  areDriversReady: false,
  drivers: [],
};

const driverSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    setDrivers: (state, action) => {
      return {
        ...state,
        drivers: action.payload,
        areDriversReady: true,
      };
    },
  },
});

export const { setDrivers } = driverSlice.actions;
export default driverSlice.reducer;
