"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const MouseGlow = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Softer springs for better performance
  const springX = useSpring(mouseX, { damping: 60, stiffness: 300 });
  const springY = useSpring(mouseY, { damping: 60, stiffness: 300 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "500px", // Reduced from 600px
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 1,
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        willChange: "transform", // Hint to browser for optimization
      }}
    />
  );
};

export default MouseGlow;
