import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>AI/ML Engineering Intern</h4>
                <h5>Developers Hub Cooperation</h5>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Developed and deployed ML models (classification, regression,
              clustering) using Scikit-learn. Built deep learning models in
              PyTorch and maintained FastAPI endpoints with database connections
              for seamless front-end/back-end integration.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Front-End Developer Intern</h4>
                <h5>Infinicore Solutions</h5>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Built dynamic interfaces using React.js for interactive user
              experiences. Integrated REST APIs with Axios/Fetch for real-time
              data and optimized website performance and responsiveness across
              devices.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Student Affairs Officer</h4>
                <h5>Aga Khan Higher Secondary School</h5>
              </div>
              <h3>2024</h3>
            </div>
            <p>
              Assisted in addressing student concerns, prepared reports for
              internal use and parent meetings, and supported implementation
              of school policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
