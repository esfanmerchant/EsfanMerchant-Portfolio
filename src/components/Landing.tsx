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
              ESFAN
              <br />
              <span>MERCHANT</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>AI/ML Engineer &</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">Front</div>
              <div className="landing-h2-2">End Dev</div>
            </h2>
            <h2>
              <div className="landing-h2-info">End Dev</div>
              <div className="landing-h2-info-1">Front</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
