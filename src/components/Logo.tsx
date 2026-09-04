import { cn } from '../utils/cn';

const logoUrl = '/assets/maiangi-online-slogan.svg';

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
    src={logoUrl}
    alt="maiangi.online"
    className={cn('block shrink-0 object-contain object-left', sizes[size], className)}
  />
);

export const LogoMark = ({ size = 'md', className }: LogoProps) => (
  <img
    src={logoUrl}
    alt="maiangi.online"
    className={cn('block shrink-0 object-contain object-left', sizes[size], className)}
  />
);

export default Logo;
