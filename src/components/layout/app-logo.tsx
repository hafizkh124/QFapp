
import Image from 'next/image';
import type { HTMLAttributes } from 'react';

interface AppLogoProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  width: number;
  height: number;
  className?: string;
  alt?: string;
  src?: string; // Allow custom src, default to /logo.png
}

export function AppLogo({ width, height, className, alt = "App Logo", src = "/logo.png", ...props }: AppLogoProps) {
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

// Helper cn function if not already globally available or imported from utils
// For this component, assuming cn is imported or available. If not, add:
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
