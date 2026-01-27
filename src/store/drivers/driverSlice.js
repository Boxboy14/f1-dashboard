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

/**
 * Exports the reducer function from the <driverSlice className=""></driverSlice>
 *
 * The reducer is a pure function that takes the current state and an action,
 * then returns a new state based on the action type. This reducer handles all
 * state updates related to drivers in the Redux store.
 *
 * By exporting driverSlice.reducer, this module provides the driver-related
 * state management logic that can be combined with other reducers to create
 * the root Redux store via configureStore() or combineReducers().
 *
 * @type {Function}
 * @returns {Object} The updated driver state
 */

export const { setDrivers } = driverSlice.actions;
export default driverSlice.reducer;
