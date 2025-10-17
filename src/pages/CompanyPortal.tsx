import { useState } from "react";
import Navbar from "@/components/Navbar";
import CompanySidebar from "@/components/company/CompanySidebar";
import CompanyDashboard from "@/components/company/CompanyDashboard";
import EmployeeManagement from "@/components/company/EmployeeManagement";
import SurveyManagement from "@/components/company/SurveyManagement";
import CompanyMetrics from "@/components/company/CompanyMetrics";
import TeamStatus from "@/components/company/TeamStatus";
import StaffingManagement from "@/components/company/StaffingManagement";
import RemoteEngagement from "@/components/company/RemoteEngagement";
import RequestsManagement from "@/components/company/RequestsManagement";
import RewardsManagement from "@/components/company/RewardsManagement";

export default function CompanyPortal() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <CompanyDashboard />;
      case "employees":
        return <EmployeeManagement />;
      case "team-status":
        return <TeamStatus />;
      case "staffing":
        return <StaffingManagement />;
      case "engagement":
        return <RemoteEngagement />;
      case "requests":
        return <RequestsManagement />;
      case "rewards":
        return <RewardsManagement />;
      case "surveys":
        return <SurveyManagement />;
      case "metrics":
        return <CompanyMetrics />;
      default:
        return <CompanyDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex">
        <CompanySidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}