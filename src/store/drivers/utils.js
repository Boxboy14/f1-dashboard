import { COUNTRY_CODE_MAP } from "../../constants/countryMap.js";

const getCountryName = (countryCode) => {
  return COUNTRY_CODE_MAP[countryCode] || countryCode;
};

const createDriverSlug = ({ full_name }) => {
  return full_name.split(" ").join("-").toLowerCase();
};

export { getCountryName, createDriverSlug };
