"use client";

import { clsx } from "clsx";
import { useRef, type HTMLAttributes, type MouseEvent } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TiltProps extends HTMLAttributes<HTMLDivElement> {}

export function Tilt({ children, className }: TiltProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) {
      return;
    }

    // Get element dimentions
    const { width, height, left, top } = ref.current.getBoundingClientRect();

    // Get relative cursor position
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Calculate the cursor's distance
    const centerX = width / 2;
    const centerY = height / 2;
    const offsetX = x - centerX;
    const offsetY = y - centerY;

    // Normalize the offset to a range of -1 to 1
    const normalizedX = offsetX / centerX;
    const normalizedY = offsetY / centerY;

    // Scale the normalized value
    const maxRotation = 10;
    const rotateX = maxRotation * normalizedY;
    const rotateY = maxRotation * normalizedX * -1; // Invert for intuitive up/down tilt

    ref.current.style.setProperty("--rotate-x", `${rotateX}deg`);
    ref.current.style.setProperty("--rotate-y", `${rotateY}deg`);
    ref.current.style.setProperty("--scale", "1.05");
  };

  const handleMouseLeave = () => {
    if (!ref.current) {
      return;
    }

    ref.current.style.setProperty("--rotate-x", "0deg");
    ref.current.style.setProperty("--rotate-y", "0deg");
    ref.current.style.setProperty("--scale", "1");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={clsx("tilt", className)}
    >
      {children}
    </div>
  );
}
