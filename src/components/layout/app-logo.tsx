import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      {...props}
      // Using text-primary for the utensils (yellow) and a direct fill for the red background shape.
      // The red background shape will not use a theme variable directly in this SVG component
      // to ensure it matches the logo's specific red, even if theme accent changes slightly.
      // However, the icon color (utensils) can be controlled by text-primary for flexibility.
    >
      <g transform="rotate(15 50 50)">
        {/* Red background shape (slanted rectangle) */}
        <path
          d="M20,10 L80,10 Q90,10 90,20 L90,80 Q90,90 80,90 L20,90 Q10,90 10,80 L10,20 Q10,10 20,10 Z"
          fill="#D92D20" // A vibrant red, close to logo
        />

        {/* Spoon - uses text-primary (should be yellow from theme) */}
        <path
          d="M40,25 C40,20 45,15 50,15 C55,15 60,20 60,25 C60,35 50,45 50,45 C50,45 40,35 40,25 Z M48,45 L52,45 L52,75 L48,75 Z"
          className="text-primary"
          fill="currentColor"
        />

        {/* Fork - uses text-primary (should be yellow from theme) */}
        <path
          d="M65,20 L75,20 L75,45 L65,45 Z M68,45 L72,45 L72,75 L68,75 Z M65,22 L67,22 L67,35 L65,35 Z M69,22 L71,22 L71,35 L69,35 Z M73,22 L75,22 L75,35 L73,35Z"
          className="text-primary"
          fill="currentColor"
          transform="translate(5, 0) rotate(-10 70 47.5)" // slight adjustment to position and angle fork
        />
      </g>
    </svg>
  );
}
