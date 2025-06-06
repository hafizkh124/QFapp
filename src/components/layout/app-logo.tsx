
import Image from 'next/image';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AppLogoProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  width: number;
  height: number;
  className?: string;
  alt?: string;
  src?: string; // Allow custom src, default to /logo.png
}

export function AppLogo({ width, height, className, alt = "Quoriam Foods Logo", src = "/logo.png", ...props }: AppLogoProps) {
  return (
    <div className={cn("relative", className)} style={{ width, height }} {...props}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority // Good for LCP elements like logos
      />
    </div>
  );
}
