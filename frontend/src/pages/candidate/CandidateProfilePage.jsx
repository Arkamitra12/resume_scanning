import { useState } from "react";

function CandidateProfilePage() {
  const [name, setName] = useState("Demo");
  const [email, setEmail] = useState("Demo@example.com");
  const [phone, setPhone] = useState("98765XXXXX");
  const [location, setLocation] = useState("Kolkata, India");
  const [education, setEducation] = useState("B.Tech Computer Science");
  const [skills, setSkills] = useState("React, Python, SQL");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="candidate-profile-page">
      <div className="candidate-profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal and professional information.</p>
      </div>

      <div className="candidate-profile-card">
        <div className="profile-avatar">
          {name.charAt(0).toUpperCase()}
        </div>

        <h2>{name}</h2>
        <p className="profile-email">{email}</p>

        <form onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <div className="profile-input-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
                required
              />
            </div>

            <div className="profile-input-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
                required
              />
            </div>

            <div className="profile-input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setSaved(false);
                }}
                required
              />
            </div>

            <div className="profile-input-group">
              <label>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setSaved(false);
                }}
              />
            </div>

            <div className="profile-input-group">
              <label>Education</label>
              <input
                type="text"
                value={education}
                onChange={(e) => {
                  setEducation(e.target.value);
                  setSaved(false);
                }}
              />
            </div>

            <div className="profile-input-group">
              <label>Skills</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => {
                  setSkills(e.target.value);
                  setSaved(false);
                }}
                placeholder="Enter skills separated by commas"
              />
            </div>
          </div>

          <button type="submit" className="profile-save-button">
            Save Profile
          </button>

          {saved && (
            <p className="profile-saved-message">
              ✓ Profile updated successfully!
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default CandidateProfilePage;