"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { formatCount } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const display = useTransform(spring, (current: number) => 
    formatCount(Math.floor(current))
  );

  if (!isClient) {
    return <span className={className}>{formatCount(value)}</span>;
  }

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
} 