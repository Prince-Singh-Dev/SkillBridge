import React, { useState } from "react";
import "../style/home.scss";

const Home = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resume, setResume] = useState(null);

  const handleResumeChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Resume size should not exceed 5MB.");
      event.target.value = "";
      return;
    }

    setResume(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!jobDescription.trim()) {
      alert("Please enter the target job description.");
      return;
    }

    if (!resume && !selfDescription.trim()) {
      alert("Please upload a resume or enter your self-description.");
      return;
    }

    // Connect your interview strategy generation API here.
    console.log({
      jobDescription,
      selfDescription,
      resume,
    });
  };

  return (
    <main className="home">
      <section className="home-container">
        {/* Header */}
        <header className="home-header">
          <h1>
            Create Your Custom <span>Interview Plan</span>
          </h1>

          <p>
            Let our AI analyze the job requirements and your unique profile to
            <br className="desktop-break" /> build a winning strategy.
          </p>
        </header>

        {/* Main Form */}
        <form className="interview-form" onSubmit={handleSubmit}>
          <div className="interview-input-group">
            {/* Left Section */}
            <div className="left">
              <div className="section-heading">
                <div className="heading-title">
                  <i className="ri-briefcase-4-line"></i>
                  <label htmlFor="jobDescription">
                    Target Job Description
                  </label>
                </div>

                <span className="badge required-badge">REQUIRED</span>
              </div>

              <div className="textarea-wrapper">
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  placeholder={`Paste the full job description here...

e.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."`}
                  value={jobDescription}
                  onChange={(event) =>
                    setJobDescription(event.target.value.slice(0, 5000))
                  }
                  maxLength={5000}
                  required
                />

                <span className="character-count">
                  {jobDescription.length} / 5000 chars
                </span>
              </div>
            </div>

            {/* Right Section */}
            <div className="right">
              <div className="section-heading">
                <div className="heading-title">
                  <i className="ri-user-line"></i>
                  <span>Your Profile</span>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="input-group">
                <div className="upload-heading">
                  <label htmlFor="resume">Upload Resume</label>
                  <span className="badge best-results-badge">
                    BEST RESULTS
                  </span>
                </div>

                <label htmlFor="resume" className="file-label">
                  <i className="ri-upload-cloud-2-line upload-icon"></i>

                  <span className="upload-text">
                    {resume ? resume.name : "Click to upload or drag & drop"}
                  </span>

                  <small>
                    {resume
                      ? `${(resume.size / 1024 / 1024).toFixed(2)} MB`
                      : "PDF or DOCX (Max 5MB)"}
                  </small>

                  <input
                    type="file"
                    name="resume"
                    id="resume"
                    accept=".pdf,.docx"
                    hidden
                    onChange={handleResumeChange}
                  />
                </label>
              </div>

              {/* Divider */}
              <div className="divider">
                <span></span>
                <p>OR</p>
                <span></span>
              </div>

              {/* Self Description */}
              <div className="input-group self-description-group">
                <label htmlFor="selfDescription">
                  Quick Self-Description
                </label>

                <textarea
                  id="selfDescription"
                  name="selfDescription"
                  placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                  value={selfDescription}
                  onChange={(event) => setSelfDescription(event.target.value)}
                />
              </div>

              {/* Info Message */}
              <div className="info-message">
                <i className="ri-information-fill"></i>

                <p>
                  Either a <strong>Resume</strong> or a{" "}
                  <strong>Self Description</strong> is required to generate a
                  personalized plan.
                </p>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="form-footer">
            <p className="generation-info">
              <i className="ri-sparkling-2-line"></i>
              AI-Powered Strategy Generation · Approx 30s
            </p>

            <button type="submit" className="generate-button">
              <i className="ri-star-fill"></i>
              Generate My Interview Strategy
            </button>
          </div>
        </form>

        {/* Bottom Footer */}
        <footer className="home-footer">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#help">Help Center</a>
        </footer>
      </section>
    </main>
  );
};

export default Home;