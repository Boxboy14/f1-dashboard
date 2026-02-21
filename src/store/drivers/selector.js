import { createDraftSafeSelector } from "@reduxjs/toolkit";

const rootSelector = (state) => state.Drivers;

const driverSelector = createDraftSafeSelector(rootSelector, (driversState) => {
  return driversState.drivers || [];
});

const driverSearchSelector = createDraftSafeSelector(
  driverSelector,
  (drivers) => {
    return drivers.map(({ full_name }) => full_name || "NA");
  },
);

export { driverSelector, driverSearchSelector };
