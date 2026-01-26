import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
      };
    },
  },
});

export default driverSlice.reducer;
