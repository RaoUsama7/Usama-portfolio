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

  const landingH2Chars = wrapChars(
    document.querySelector(".landing-h2-info") as HTMLElement
  );

  anime({
    targets: landingH2Chars,
    opacity: [0, 1],
    translateY: [80, 0],
    filter: ["blur(5px)", "blur(0px)"],
    duration: 1200,
    delay: 300,
    easing: "easeInOutCubic",
    delayIncrement: 25,
  } as any);

  gsap.fromTo(
    ".landing-info-h2",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      y: 0,
      delay: 0.8,
    }
  );
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

  const landingText3 = document.querySelector(
    ".landing-h2-info-1"
  ) as HTMLElement | null;
  const landingText4 = document.querySelector(
    ".landing-h2-1"
  ) as HTMLElement | null;
  const landingText5 = document.querySelector(
    ".landing-h2-2"
  ) as HTMLElement | null;

  if (landingText3 && landingText4 && landingText5) {
    loopTextAnime(landingText3, landingText2Element(".landing-h2-info"));
    loopTextAnime(landingText4, landingText5);
  }
}

function landingText2Element(selector: string): HTMLElement {
  return document.querySelector(selector) as HTMLElement;
}

function loopTextAnime(el1: HTMLElement, el2: HTMLElement) {
  const chars1 = wrapChars(el1);
  const chars2 = wrapChars(el2);
  const delay = 4000;
  const delay2 = delay * 2 + 1000;

  function cycle() {
    anime
      .timeline()
      .add({
        targets: chars2,
        opacity: [0, 1],
        translateY: [80, 0],
        duration: 1200,
        easing: "easeInOutCubic",
        delay,
      })
      .add({
        targets: chars1,
        translateY: [80, 0],
        duration: 1200,
        easing: "easeInOutCubic",
        delay: delay2,
      })
      .add({
        targets: chars1,
        translateY: [0, -80],
        duration: 1200,
        easing: "easeInOutCubic",
        delay,
      })
      .add({
        targets: chars2,
        translateY: [0, -80],
        duration: 1200,
        easing: "easeInOutCubic",
        delay: delay2,
        complete: cycle,
      });
  }

  cycle();
}
