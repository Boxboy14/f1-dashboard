import { cssColor } from "../../../../theme/cssColor.js";

export const teamColor = (team_colour) =>
  team_colour ? `#${team_colour}` : cssColor("--salt-color-gray-500");
