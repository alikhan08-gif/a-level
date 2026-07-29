export function UzFlag({ className }: { className?: string }) {
  const starRows = [
    { y: 2.1, count: 3 },
    { y: 3.6, count: 4 },
    { y: 5.1, count: 5 },
  ];
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden>
      <rect width="30" height="20" fill="#1eb53a" />
      <rect width="30" height="13.34" fill="#fff" />
      <rect width="30" height="6.67" fill="#0099b5" />
      <rect y="6.1" width="30" height="1.14" fill="#ce1126" />
      <rect y="12.76" width="30" height="1.14" fill="#ce1126" />
      <path
        d="M6.6 1.4a2.6 2.6 0 1 0 0 4.9 3.2 3.2 0 1 1 0-4.9Z"
        fill="#fff"
      />
      {starRows.map((row, ri) =>
        Array.from({ length: row.count }).map((_, i) => {
          const startX = 12.5 - (row.count - 1) * 0.95;
          const cx = startX + i * 1.9;
          return <circle key={`${ri}-${i}`} cx={cx} cy={row.y} r="0.42" fill="#fff" />;
        })
      )}
    </svg>
  );
}

export function GbFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 13.5 9M30 0 16.5 9M0 20 13.5 11M30 20 16.5 11" stroke="#c8102e" strokeWidth="1.6" />
      <path d="M15 0V20M0 10H30" stroke="#fff" strokeWidth="6.6" />
      <path d="M15 0V20M0 10H30" stroke="#c8102e" strokeWidth="4" />
    </svg>
  );
}
