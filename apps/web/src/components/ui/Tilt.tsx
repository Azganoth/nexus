"use client";

import { clsx } from "clsx";
import { useRef, type HTMLAttributes, type MouseEvent } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TiltProps extends HTMLAttributes<HTMLDivElement> {}

export function Tilt({ children, className, ...otherProps }: TiltProps) {
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

    ref.current.style.setProperty("--tilt-rotate-x", `${rotateX}deg`);
    ref.current.style.setProperty("--tilt-rotate-y", `${rotateY}deg`);
    ref.current.style.setProperty("--tilt-scale", "1.05");
  };

  const handleMouseLeave = () => {
    if (!ref.current) {
      return;
    }

    ref.current.style.setProperty("--tilt-rotate-x", "initial");
    ref.current.style.setProperty("--tilt-rotate-y", "initial");
    ref.current.style.setProperty("--tilt-scale", "initial");
  };

  return (
    <div
      ref={ref}
      className={clsx("tilt", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...otherProps}
    >
      {children}
    </div>
  );
}
