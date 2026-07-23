// Logo de Sky Blue Creators: tres barras ascendentes (celeste → azul → navy).
export function Logo({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Sky Blue Creators"
    >
      <rect x="6" y="27" width="9" height="15" rx="2" fill="#4a90cd" />
      <rect x="19.5" y="16" width="9" height="26" rx="2" fill="#1e63a6" />
      <rect x="33" y="6" width="9" height="36" rx="2" fill="#0f2c4d" />
    </svg>
  );
}
