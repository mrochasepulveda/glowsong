/**
 * Foqo Icon System — SVG icons with brand personality
 * Style: geometric, minimal, 2px stroke, rounded caps
 */

type IconProps = {
  size?: number;
  color?: string;
};

export function IconFlame({ size = 24, color = "var(--accent)" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C12 2 5 9 5 14a7 7 0 0 0 14 0c0-5-7-12-7-12Z"
        fill={color}
        fillOpacity={0.15}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12c0 0-3 2.5-3 4.5a3 3 0 0 0 6 0c0-2-3-4.5-3-4.5Z"
        fill={color}
        fillOpacity={0.4}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconClock({ size = 24, color = "var(--accent)" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <path d="M12 7v5l3.5 2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSearch({ size = 24, color = "var(--accent)" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx={10.5} cy={10.5} r={6.5} stroke={color} strokeWidth={2} />
      <path d="M15.5 15.5L20 20" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <path d="M8 10.5h5" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    </svg>
  );
}

export function IconTicketX({ size = 24, color = "var(--accent)" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"
        stroke={color}
        strokeWidth={2}
      />
      <path d="M10 10l4 4M14 10l-4 4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function IconTarget({ size = 24, color = "var(--accent)" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <circle cx={12} cy={12} r={5} stroke={color} strokeWidth={2} opacity={0.5} />
      <circle cx={12} cy={12} r={1.5} fill={color} />
    </svg>
  );
}

export function IconPin({ size = 24, color = "var(--accent)" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10Z"
        stroke={color}
        strokeWidth={2}
        fill={color}
        fillOpacity={0.1}
      />
      <circle cx={12} cy={11} r={2.5} stroke={color} strokeWidth={2} />
    </svg>
  );
}

export function IconBrain({ size = 24, color = "var(--accent)" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 4a4 4 0 0 0-4 4c0 1-.5 2-1.5 2.5A3.5 3.5 0 0 0 4 14a3.5 3.5 0 0 0 3.5 3.5c.5 0 1 .5 1 1V20h7v-1.5c0-.5.5-1 1-1A3.5 3.5 0 0 0 20 14a3.5 3.5 0 0 0-2.5-3.5C16.5 10 16 9 16 8a4 4 0 0 0-4-4Z"
        stroke={color}
        strokeWidth={2}
        fill={color}
        fillOpacity={0.1}
        strokeLinejoin="round"
      />
      <path d="M10 13h4" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      <path d="M12 11v4" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    </svg>
  );
}

export function IconCheck({ size = 24, color = "var(--voy)" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.1} />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
