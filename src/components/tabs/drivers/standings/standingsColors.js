import { cssColor } from "../../../../theme/cssColor.js";

export const driverColor = (team_colour) =>
  team_colour ? `#${team_colour}` : cssColor("--salt-color-gray-500");
