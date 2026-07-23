// Íconos SVG del sistema (trazos finos, estilo lucide) — sin dependencias.

function Base({
  children,
  className = "h-[18px] w-[18px]",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconDashboard = ({ className }: { className?: string }) => (
  <Base className={className}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Base>
);

export const IconUsers = ({ className }: { className?: string }) => (
  <Base className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Base>
);

export const IconCoins = ({ className }: { className?: string }) => (
  <Base className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.8 9.2c-.55-.9-1.6-1.45-2.8-1.45-1.7 0-2.8.95-2.8 2.1 0 1.3 1.25 1.75 2.8 2.15 1.55.4 2.8.85 2.8 2.15 0 1.15-1.1 2.1-2.8 2.1-1.2 0-2.25-.55-2.8-1.45" />
    <path d="M12 5.8v2M12 16.2v2" />
  </Base>
);

export const IconAcademy = ({ className }: { className?: string }) => (
  <Base className={className}>
    <path d="M22 9.5 12 4.5 2 9.5l10 5 10-5z" />
    <path d="M6 12v4.5c0 1.4 2.7 2.8 6 2.8s6-1.4 6-2.8V12" />
  </Base>
);

export const IconFalcon = ({ className }: { className?: string }) => (
  <Base className={className}>
    <path d="M20.2 12.2a6 6 0 0 0-8.5-8.5L5 10.4V19h8.6z" />
    <path d="M16 8 2 22" />
    <path d="M17.5 15H9" />
  </Base>
);

export const IconWallet = ({ className }: { className?: string }) => (
  <Base className={className}>
    <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
    <path d="M2.5 10h19" />
    <path d="M16.5 15h.01" />
  </Base>
);

export const IconTeam = ({ className }: { className?: string }) => (
  <Base className={className}>
    <rect x="2.5" y="7.5" width="19" height="12.5" rx="2.5" />
    <path d="M8.5 7.5v-2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
    <path d="M2.5 12.5h19" />
  </Base>
);

export const IconGlobe = ({ className }: { className?: string }) => (
  <Base className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14.5 14.5 0 0 1 0 18 14.5 14.5 0 0 1 0-18z" />
  </Base>
);

export const IconPlug = ({ className }: { className?: string }) => (
  <Base className={className}>
    <path d="M13 2 3.5 13.5H12l-1 8.5L20.5 10.5H12z" />
  </Base>
);

export const IconBell = ({ className }: { className?: string }) => (
  <Base className={className}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Base>
);

export const IconTrend = ({ className }: { className?: string }) => (
  <Base className={className}>
    <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
    <path d="M16 7h6v6" />
  </Base>
);

export const IconShield = ({ className }: { className?: string }) => (
  <Base className={className}>
    <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z" />
  </Base>
);

export const IconClock = ({ className }: { className?: string }) => (
  <Base className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </Base>
);
