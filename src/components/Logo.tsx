import { cn } from '../utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { circle: 'h-9 w-9 text-[20px]', title: 'text-[26px]', sub: 'text-[11px]', gap: '2px' },
  md: { circle: 'h-11 w-11 text-[24px]', title: 'text-[30px]', sub: 'text-[13px]', gap: '2px' },
  lg: { circle: 'h-16 w-16 text-[36px]', title: 'text-[44px]', sub: 'text-[18px]', gap: '3px' },
};

export const LogoMark = ({ size = 'md', className }: LogoProps) => {
  const s = sizes[size];
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-[#c8162a] font-black lowercase leading-none text-[#1a1a1a]',
        s.circle,
        className,
      )}
    >
      m
    </span>
  );
};

const Logo = ({ size = 'md', className }: LogoProps) => {
  const s = sizes[size];
  return (
    <div className={cn('flex items-baseline', className)} style={{ gap: s.gap }}>
      <LogoMark size={size} />
      <span className={cn('font-extrabold lowercase leading-none tracking-tight text-[#2b2b2b]', s.title)}>
        aiangi
      </span>
      <span className={cn('font-medium lowercase leading-none tracking-tight text-[#9a9a9a]', s.sub)}>.online</span>
    </div>
  );
};

export default Logo;
