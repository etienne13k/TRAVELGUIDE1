"use client";
import { useEffect, useRef, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  scale?: boolean;
  delay?: 0 | 1 | 2 | 3 | 4;
  tag?: "div" | "section" | "article";
}

export default function ScrollReveal({ children, className = "", scale = false, delay = 0, tag: Tag = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const base = scale ? "reveal-scale" : "reveal";
  const d = delay ? ` ${base}-d${delay}` : "";

  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement & HTMLElement>} className={`${base}${d} ${className}`}>
      {children}
    </Tag>
  );
}
