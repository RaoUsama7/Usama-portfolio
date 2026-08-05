import { useEffect, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";

import Marquee from "react-fast-marquee";

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Runs in an effect, not in render: the previous version scheduled a fresh
  // pair of timers on every re-render once percent hit 100.
  const isComplete = percent >= 100;
  useEffect(() => {
    if (!isComplete) return;
    let handoff: ReturnType<typeof setTimeout>;
    const toWelcome = setTimeout(() => {
      setLoaded(true);
      handoff = setTimeout(() => setIsLoaded(true), 400);
    }, 200);
    return () => {
      clearTimeout(toWelcome);
      clearTimeout(handoff);
    };
  }, [isComplete]);

  useEffect(() => {
    if (!isLoaded) return;
    let dismiss: ReturnType<typeof setTimeout>;
    import("./utils/initialFX").then((module) => {
      setClicked(true);
      dismiss = setTimeout(() => {
        module.initialFX?.();
        setIsLoading(false);
      }, 400);
    });
    return () => clearTimeout(dismiss);
  }, [isLoaded]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          Usama
        </a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>
      <div className="loading-screen">
        <div className="loading-marquee">
          <Marquee>
            <span> Full Stack Developer</span> <span>Software Engineer</span>
            <span> Full Stack Developer</span> <span>Software Engineer</span>
          </Marquee>
        </div>
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;

/** Share of the bar driven by the real model download; the rest covers decode. */
const DOWNLOAD_SHARE = 85;

/**
 * Drives the loading bar from the actual model download rather than a timer.
 * `download` maps real bytes onto 0-85%, `decoding` creeps through the decrypt
 * and GLTF parse phase, and `loaded` finishes the bar off.
 */
export const setProgress = (setLoading: (value: number) => void) => {
  let percent = 0;
  let interval: ReturnType<typeof setInterval> | undefined;

  // The bar must never move backwards, whichever phase reports a value.
  const set = (value: number) => {
    const next = Math.min(100, Math.max(percent, Math.round(value)));
    if (next !== percent) {
      percent = next;
      setLoading(percent);
    }
  };

  function download(fraction: number) {
    set(fraction * DOWNLOAD_SHARE);
  }

  /**
   * Decrypt + Draco parse happen off the network, so there is nothing real to
   * measure. Creep slowly towards 97% so the bar doesn't look frozen, and stop
   * short of 100 so completion still means completion.
   */
  function decoding() {
    clearInterval(interval);
    interval = setInterval(() => {
      if (percent >= 97) clearInterval(interval);
      else set(percent + 1);
    }, 90);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (percent < 100) {
          set(percent + 2);
        } else {
          clearInterval(interval);
          resolve(percent);
        }
      }, 10);
    });
  }

  function clear() {
    clearInterval(interval);
    set(100);
  }

  return { download, decoding, loaded, clear };
};
