import { PropsWithChildren } from "react";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              Usama
              <br />
              <span>Rao</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>A Full Stack</h3>
            <h2 className="landing-info-h2">
              <span className="landing-role landing-role-primary">
                <strong>Developer</strong>
              </span>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
