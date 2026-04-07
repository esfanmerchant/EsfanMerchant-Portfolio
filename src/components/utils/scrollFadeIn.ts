import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * One-shot fade-in/up reveals on scroll for headings and content blocks.
 *
 * Targets are intentionally child elements (h2, h3, p, .career-info-box) so
 * this never collides with the section-level character timelines defined in
 * GsapScroll.ts (which already animate `.about-section`, `.career-section`,
 * etc. on desktop when the 3D character loads).
 *
 * On mobile the character timelines never run, so this is what gives the page
 * any sense of motion at all.
 */
export function setupScrollFadeIns() {
  const tracked: HTMLElement[] = [];

  const reveal = (
    selector: string,
    opts: { y?: number; stagger?: number; start?: string } = {}
  ) => {
    const els = gsap.utils.toArray<HTMLElement>(selector);
    if (els.length === 0) return;
    gsap.set(els, { opacity: 0, y: opts.y ?? 32 });
    tracked.push(...els);
    ScrollTrigger.batch(els, {
      start: opts.start ?? "top 85%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          stagger: opts.stagger ?? 0.12,
          overwrite: "auto",
        }),
    });
  };

  // About — fade the heading + paragraph (not the section itself).
  reveal(".about-me .title");
  reveal(".about-me .para", { start: "top 80%" });

  // Career — heading and the timeline boxes.
  reveal(".career-section h2");
  reveal(".career-info-box", { stagger: 0.18, start: "top 85%" });

  // Work / Contact headings — small polish so they don't pop in cold.
  reveal(".work-section h2");
  reveal(".contact-section h3");

  // WhatIDo title (the "What I Do" big heading).
  reveal(".whatIDO .title");

  // Mobile/iOS browsers shift the viewport (address bar) and the 3D scene
  // finishes loading after this function runs, so the ScrollTrigger trigger
  // positions cached above can become stale. Refresh once the window has
  // fully loaded so triggers fire against the final layout.
  const refresh = () => ScrollTrigger.refresh();
  if (document.readyState === "complete") {
    requestAnimationFrame(refresh);
  } else {
    window.addEventListener("load", refresh, { once: true });
  }

  // Safety net: if any tracked element is still hidden after the page has had
  // time to settle (e.g. ScrollTrigger never fired because the element was
  // already past the trigger window on a small mobile viewport), force it
  // visible. Better to skip the animation than to leave the section blank.
  setTimeout(() => {
    const stillHidden = tracked.filter(
      (el) => parseFloat(getComputedStyle(el).opacity || "1") < 0.05
    );
    if (stillHidden.length > 0) {
      gsap.to(stillHidden, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, 2500);
}
