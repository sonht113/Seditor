interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function Logo({
  size = 40,
  withWordmark = false,
  className = "",
}: LogoProps) {
  const gradientId = `se-logo-grad-${size}`;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2383e2" />
            <stop offset="100%" stopColor="#5b9ff5" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill={`url(#${gradientId})`} />
        <path
          d="M40 22c-2-3-6-5-10-5-5 0-9 3-9 7 0 4 4 6 9 7s9 3 9 7c0 4-4 7-9 7-4 0-8-2-10-5"
          fill="none"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && (
        <span className="text-xl font-bold tracking-tight text-[var(--docs-text)]">
          Seditor
        </span>
      )}
    </div>
  );
}
