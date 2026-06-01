export function createTeamSlug({ team_name }) {
  return team_name.replace(/\s+/g, "-").toLowerCase();
}
