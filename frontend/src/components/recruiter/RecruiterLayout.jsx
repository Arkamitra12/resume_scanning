import { Outlet } from "react-router-dom";
import RecruiterSidebar from "./RecruiterSidebar";

function RecruiterLayout() {
  return (
    <div className="recruiter-layout">
      <RecruiterSidebar />

      <main className="recruiter-main">
        <Outlet />
      </main>
    </div>
  );
}

export default RecruiterLayout;