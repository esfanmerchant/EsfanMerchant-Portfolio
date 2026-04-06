import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import setSplitText from "./utils/splitText";
import { setupScrollFadeIns } from "./utils/scrollFadeIn";

const TechStack = lazy(() => import("./TechStack"));

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

  useEffect(() => {
    const apply = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    apply();

    // One-shot fade-in reveals on scroll. Wait a tick so all sections are
    // mounted before ScrollTrigger calculates positions.
    const fadeTimer = setTimeout(() => setupScrollFadeIns(), 0);

    let timer: ReturnType<typeof setTimeout> | null = null;
    const resizeHandler = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(apply, 150);
    };
    window.addEventListener("resize", resizeHandler);
    return () => {
      if (timer) clearTimeout(timer);
      clearTimeout(fadeTimer);
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <WhatIDo />
            <Career />
            <Work />
            {isDesktopView && (
              <Suspense fallback={<div>Loading....</div>}>
                <TechStack />
              </Suspense>
            )}
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
