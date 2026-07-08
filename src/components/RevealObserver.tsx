"use client";
import { useEffect } from "react";

export default function RevealObserver() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -32px 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-scale").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return null;
}
