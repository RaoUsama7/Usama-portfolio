import { ScrollTrigger } from "gsap/ScrollTrigger";
import anime from "animejs/lib/anime.es.js";
import { wrapChars, wrapWords } from "./textSplitHelpers";

ScrollTrigger.config({ ignoreMobileResize: true });

export default function setSplitText() {
  if (window.innerWidth < 900) return;
  const paras: NodeListOf<HTMLElement> = document.querySelectorAll(".para");
  const titles: NodeListOf<HTMLElement> = document.querySelectorAll(".title");

  const triggerStart =
    window.innerWidth <= 1024 ? "top 60%" : "20% 60%";

  paras.forEach((para) => {
    para.classList.add("visible");
    const words = wrapWords(para);

    ScrollTrigger.create({
      trigger: para.parentElement?.parentElement ?? para,
      start: triggerStart,
      toggleActions: "play pause resume reverse",
      onEnter: () => {
        anime({
          targets: words,
          opacity: [0, 1],
          translateY: [80, 0],
          duration: 1000,
          easing: "easeOutCubic",
          delay: anime.stagger(20),
        });
      },
    });
  });

  titles.forEach((title) => {
    const chars = wrapChars(title);

    ScrollTrigger.create({
      trigger: title.parentElement?.parentElement ?? title,
      start: triggerStart,
      toggleActions: "play pause resume reverse",
      onEnter: () => {
        anime({
          targets: chars,
          opacity: [0, 1],
          translateY: [80, 0],
          rotate: [10, 0],
          duration: 800,
          easing: "easeInOutQuad",
          delay: anime.stagger(30),
        });
      },
    });
  });

  ScrollTrigger.addEventListener("refresh", () => setSplitText());
}
