// Padrão de ondas das faixas vermelhas. O pai precisa de position: relative e overflow: hidden.
export function Ondas({ opacity = 0.28 }: { opacity?: number }) {
  return (
    <svg aria-hidden="true" width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0, opacity }}>
      <defs>
        <pattern id="ondas" width="60" height="30" patternUnits="userSpaceOnUse">
          <g fill="#e3141f" stroke="#ff5a61" strokeWidth="1.5">
            {[[30, 15], [0, 30], [60, 30]].map(([cx, cy]) =>
              [30, 22, 14, 6].map((r) => <circle key={`${cx}-${r}`} cx={cx} cy={cy} r={r} />),
            )}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ondas)" />
    </svg>
  );
}
