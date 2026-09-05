import { cn } from '../utils/cn';

const logoUrls = {
  header: '/assets/maiangi-logo-header.png',
  large: '/assets/maiangi-logo-large.png',
  mark: '/assets/maiangi-mark-S12.png',
};

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-10 w-[150px]',
  md: 'h-12 w-[198px]',
  lg: 'h-24 w-[320px]',
};

const Logo = ({ size = 'md', className }: LogoProps) => (
  <img
    src={size === 'lg' ? logoUrls.large : logoUrls.header}
    alt="maiangi.online"
    className={cn('block shrink-0 object-contain object-left', sizes[size], className)}
  />
);

export const LogoMark = ({ className }: LogoProps) => (
  <img
    src={logoUrls.mark}
    alt="maiangi.online"
    className={cn('block h-10 w-10 shrink-0 object-contain', className)}
  />
);

export default Logo;
