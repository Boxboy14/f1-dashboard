import { cssColor } from "../../../../theme/cssColor.js";

// A team's line/label colour comes from their team colour (API data, a hex
// without the leading "#"). When it's missing, fall back to a readable neutral
// resolved from a Salt token (so it still themes), rather than a hardcoded hex.
export const teamColor = (team_colour) =>
  team_colour ? `#${team_colour}` : cssColor("--salt-color-gray-500");
