import React from "react";
import * as LucideIcons from "lucide-react";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 24, className = "" }: IconProps) {
  const IconComponent = (LucideIcons as any)[
    name.split("-").map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join("")
  ];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent size={size} className={className} />;
}
