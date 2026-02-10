import { createDraftSafeSelector } from "@reduxjs/toolkit";

const rootSelector = (state) => state.Drivers;

const driverSelector = createDraftSafeSelector(rootSelector, (driversState) => {
  return driversState.drivers || [];
});

export { driverSelector };
