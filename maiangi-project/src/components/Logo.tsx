import { cn } from '../utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-[132px]',
  md: 'h-10 w-[166px]',
  lg: 'h-16 w-[267px]',
};

const Logo = ({ size = 'md', className }: LogoProps) => (
  <img
    src="/maiangi.online.svg"
    alt="maiangi.online"
    className={cn('block shrink-0 object-contain object-left', sizes[size], className)}
  />
);

export const LogoMark = ({ size = 'md', className }: LogoProps) => (
  <img
    src="/maiangi.online.svg"
    alt="maiangi.online"
    className={cn('block shrink-0 object-contain object-left', sizes[size], className)}
  />
);

export default Logo;
