"use client";
import { useEffect } from "react";

export default function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-scale");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    // Fallback: reveal everything after 800ms in case observer doesn't fire
    const t = setTimeout(() => {
      els.forEach((el) => el.classList.add("in-view"));
    }, 800);
    return () => { obs.disconnect(); clearTimeout(t); };
  }, []);
  return null;
}
