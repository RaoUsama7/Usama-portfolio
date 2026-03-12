import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollTrigger);
export let smoother: { scrollTo: (target: string | Element | null, smooth?: boolean, position?: string) => void; scrollTop: (value: number) => void; paused: (value: boolean) => void } = {
  scrollTo: (target) => {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;
    if (element instanceof HTMLElement) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  },
  scrollTop: (value: number) => {
    window.scrollTo({ top: value, behavior: "smooth" });
  },
  paused: () => {
    // no-op placeholder to mirror ScrollSmoother API
  },
};

const Navbar = () => {
  useEffect(() => {
    smoother.scrollTop(0);

    let links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        if (window.innerWidth > 1024) {
          e.preventDefault();
          let elem = e.currentTarget as HTMLAnchorElement;
          let section = elem.getAttribute("data-href");
          smoother.scrollTo(section);
        }
      });
    });
    // native smooth scroll doesn't require refresh on resize
  }, []);
  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          Usama
        </a>
        <a
          href="mailto:raorvp20@gmail.com"
          className="navbar-connect"
          data-cursor="disable"
        >
          raorvp20@gmail.com
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
