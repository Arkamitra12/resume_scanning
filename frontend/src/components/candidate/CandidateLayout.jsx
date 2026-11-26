

import { Outlet } from "react-router-dom";
import CandidateNavbar from "./CandidateNavbar";

function CandidateLayout() {
  return (
    <div className="candidate-layout">
      <CandidateNavbar />

      <main className="candidate-main">
        <Outlet />
      </main>
    </div>
  );
}

export default CandidateLayout;