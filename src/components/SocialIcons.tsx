import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaFacebook,
} from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect } from "react";
import HoverLinks from "./HoverLinks";

const SocialIcons = () => {
  useEffect(() => {
    // Skip the magnetic-cursor animation on touch devices and reduced-motion users
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const social = document.getElementById("social");
    if (!social) return;

    const cleanups: Array<() => void> = [];

    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement | null;
      if (!link) return;

      let rect = elem.getBoundingClientRect();
      let mouseX = rect.width / 2;
      let mouseY = rect.height / 2;
      let currentX = 0;
      let currentY = 0;
      let frameId = 0;

      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);
        frameId = requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x < 40 && x > 10 && y < 40 && y > 5) {
          mouseX = x;
          mouseY = y;
        } else {
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
      };

      const onResize = () => {
        rect = elem.getBoundingClientRect();
      };

      document.addEventListener("mousemove", onMouseMove);
      window.addEventListener("resize", onResize);
      frameId = requestAnimationFrame(updatePosition);

      cleanups.push(() => {
        document.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(frameId);
      });
    });

    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a
            href="https://github.com/esfanmerchant"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
          >
            <FaGithub />
          </a>
        </span>
        <span>
          <a
            href="https://www.linkedin.com/in/esfan-merchant-488817305/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile"
          >
            <FaLinkedinIn />
          </a>
        </span>
        <span>
          <a
            href="https://www.instagram.com/merchantesfan/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram profile"
          >
            <FaInstagram />
          </a>
        </span>
        <span>
          <a
            href="https://www.facebook.com/profile.php?id=61560831914681"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook profile"
          >
            <FaFacebook />
          </a>
        </span>
      </div>
      <a
        className="resume-button"
        href="/Esfan_Merchant_compressed.pdf"
        target="_blank"
        rel="noreferrer"
        aria-label="Download resume PDF"
      >
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
