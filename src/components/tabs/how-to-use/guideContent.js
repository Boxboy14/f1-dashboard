export const GUIDE_SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    description:
      "A quick snapshot of the whole season — see which races have happened, who's leading, and who took pole position and the fastest lap at each one.",
    controls: [
      "Pick a season from the menu in the top-right corner to see that year's races and leader.",
      "Click on any race card to see that weekend's full results.",
    ],
    interactionTip: null,
  },
  {
    id: "drivers",
    title: "Drivers",
    description:
      "See every driver competing in the selected season, side by side with charts showing how their points and championship ranking changed race by race.",
    controls: [
      "Pick a season from the top-right menu to switch years.",
      "Type a driver's name into the search box to jump straight to them.",
    ],
    interactionTip:
      "Double-click a driver's name in the list to open their full profile, including their team, number, and season stats.",
  },
  {
    id: "teams",
    title: "Teams",
    description:
      "See how every team ranks in the championship, along with charts showing how their points and position changed across the season.",
    controls: ["Pick a season from the top-right menu to switch years."],
    interactionTip:
      "Double-click a team's name in the list to see more detail about that team, including their current drivers.",
  },
  {
    id: "calendar",
    title: "Calendar",
    description:
      "Browse every race on the calendar for the selected season, including its date, location, and whether it's upcoming, in progress, or finished.",
    controls: [
      "Pick a season from the top-right menu to see that year's full calendar.",
      "Use the column headers to sort or filter the list, for example by status or country.",
    ],
    interactionTip:
      "Double-click a race to see its practice, qualifying, and race sessions. From there, double-click any session to see its full results.",
  },
  {
    id: "telemetry",
    title: "Telemetry",
    description:
      "Compare how two drivers drove a specific lap, side by side — speed, braking, and more, plotted across the track.",
    controls: [
      "Choose a race weekend, then a session (such as Qualifying or the Race).",
      "Pick up to two drivers to compare.",
      "Choose a lap to look at — by default, each driver's fastest lap is shown.",
      "Once everything is selected, use the download button to save the comparison.",
    ],
    interactionTip: null,
  },
  {
    id: "feedback",
    title: "Feedback",
    description:
      "Have an idea or spotted something that could be better? The Feedback page lets you send a note straight to the team.",
    controls: [],
    interactionTip: null,
  },
];

export const LIVE_SESSION_NOTICE =
  "If a live F1 session is ongoing (Practice, Qualifying, Sprint, Race) you won't be able to see any data on the app. Kindly wait until the live session is over.";

export const ASSISTANT_GUIDE = {
  location:
    "Look for the chat icon in the bottom-right corner of any page. Clicking it opens a chat window in the bottom-left where you can type questions.",
  capabilities: [
    "Race results, standings, pit stops, and other facts from the 2023, 2024, and 2025 seasons.",
    "General Formula 1 knowledge — rules, history, and background that isn't tied to a specific season.",
  ],
  limitations: [
    "It only has verified race data for the 2023–2025 seasons — for anything outside that range, it will let you know rather than guess.",
    "It can't answer questions about a session that's currently live and still in progress.",
  ],
  telemetryReportSteps: [
    "Tell it the Grand Prix you're interested in.",
    "Tell it which session — Practice, Qualifying, Sprint, or the Race.",
    "Name the two drivers you want to compare.",
    "Tell it which lap to look at, or ask for the fastest lap.",
    "It will then prepare a downloadable report comparing both drivers on that lap.",
  ],
};
