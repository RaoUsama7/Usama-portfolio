import gsap from "gsap";
import anime from "animejs/lib/anime.es.js";
import { smoother } from "../Navbar";
import { wrapChars } from "./textSplitHelpers";

export function initialFX() {
  document.body.style.overflowY = "auto";
  smoother.paused(false);
  document.getElementsByTagName("main")[0].classList.add("main-active");
  gsap.to("body", {
    backgroundColor: "#0a0e17",
    duration: 0.5,
    delay: 1,
  });

  const landingChars = wrapChars([
    ...Array.from(
      document.querySelectorAll<HTMLElement>(
        ".landing-info h3, .landing-intro h2, .landing-intro h1"
      )
    ),
  ]);

  anime({
    targets: landingChars,
    opacity: [0, 1],
    translateY: [80, 0],
    filter: ["blur(5px)", "blur(0px)"],
    duration: 1200,
    delay: 300,
    easing: "easeInOutCubic",
    delayIncrement: 25,
  } as any);

  gsap.fromTo(
    [".header", ".icons-section", ".nav-fade"],
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      delay: 0.1,
    }
  );
}
