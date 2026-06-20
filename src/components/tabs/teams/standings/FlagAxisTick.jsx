// Recharts custom X-axis tick: renders the round's country flag as a small
// centered image under the tick. `rounds` maps the round number (the X datum)
// to its flag URL.
const FLAG_W = 20;
const FLAG_H = 13;

const FlagAxisTick = ({ x, y, payload, rounds }) => {
  const round = rounds.find((r) => r.round === payload.value);
  if (!round?.countryFlag) return null;
  return (
    <image
      href={round.countryFlag}
      x={x - FLAG_W / 2}
      y={y + 4}
      width={FLAG_W}
      height={FLAG_H}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{round.countryName}</title>
    </image>
  );
};

export default FlagAxisTick;
