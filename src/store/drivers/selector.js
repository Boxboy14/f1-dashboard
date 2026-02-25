import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { getCountryName } from "./utils.js";

const rootSelector = (state) => state.Drivers;

const driverSelector = createDraftSafeSelector(rootSelector, (driversState) => {
  return (
    driversState.drivers.map(
      ({ first_name, last_name, country_code, ...rest }) => {
        return {
          ...rest,
          country_code: getCountryName(country_code),
          full_name: `${first_name} ${last_name}`,
          first_name,
          last_name,
        };
      },
    ) || []
  );
});

const driverSearchSelector = createDraftSafeSelector(
  driverSelector,
  (drivers) => {
    return drivers.map(({ full_name }) => full_name || "NA");
  },
);

export { driverSelector, driverSearchSelector };
