"use client";

import { cn } from "@/lib/utils";

interface HighlightedTextProps {
  text: string;
  highlight?: string;
  className?: string;
}

export function HighlightedText({ text, highlight, className }: HighlightedTextProps) {
  if (!highlight) return <span className={className}>{text}</span>;

  return (
    <span 
      className={cn(className, "highlighted-text")}
      dangerouslySetInnerHTML={{ 
        __html: highlight 
      }} 
    />
  );
} 