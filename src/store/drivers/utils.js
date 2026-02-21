import { COUNTRY_CODE_MAP } from "../../constants/countryMap.js";

const getCountryName = (countryCode) => {
  return COUNTRY_CODE_MAP[countryCode] || countryCode;
};

export { getCountryName };
