interface AvatarBadgeProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AvatarBadge({ name, color, size = 'md' }: AvatarBadgeProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : '';

  return (
    <div className={`avatar ${sizeClass}`} style={{ background: color }} title={name}>
      {initials}
    </div>
  );
}
