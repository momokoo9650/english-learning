import React from "react";

interface FaceContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function FaceContentContainer({ 
  children, 
  className = "" 
}: FaceContentContainerProps) {
  return (
    <div className={`w-full mx-auto ${className}`}>
      {children}
    </div>
  );
}
