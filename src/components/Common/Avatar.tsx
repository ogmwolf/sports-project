interface AvatarProps {
  initials: string;
  size?: number;
  color?: string;
  className?: string;
}

export default function Avatar({ initials, size = 38, color = "#1A6B3C", className = "" }: AvatarProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}
