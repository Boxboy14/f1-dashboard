const COMPOUNDS = {
  SOFT: { color: "var(--salt-color-red-500)", letter: "S" },
  MEDIUM: { color: "var(--salt-color-citrine-500)", letter: "M" },
  HARD: { color: "var(--salt-color-gray-400)", letter: "H" },
  INTERMEDIATE: { color: "var(--salt-color-green-500)", letter: "I" },
  WET: { color: "var(--salt-color-blue-500)", letter: "W" },
};

const TyreIcon = ({ compound, size = 22 }) => {
  const c = COMPOUNDS[compound?.toUpperCase()];
  if (!c) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={`${compound} tyre`}
    >
      <circle cx="12" cy="12" r="11" style={{ fill: c.color }} />
      <circle
        cx="12"
        cy="12"
        r="8"
        style={{ fill: "var(--salt-container-primary-background)" }}
      />
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fill: c.color, fontWeight: 700, fontSize: 10 }}
      >
        {c.letter}
      </text>
    </svg>
  );
};

export default TyreIcon;
