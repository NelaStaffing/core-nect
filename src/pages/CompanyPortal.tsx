import { useState } from "react";
import Navbar from "@/components/Navbar";
import CompanySidebar from "@/components/company/CompanySidebar";
import CompanyDashboard from "@/components/company/CompanyDashboard";
import EmployeeManagement from "@/components/company/EmployeeManagement";
import SurveyManagement from "@/components/company/SurveyManagement";
import CompanyMetrics from "@/components/company/CompanyMetrics";
import ResourcesManagement from "@/components/company/ResourcesManagement";
import StaffingManagement from "@/components/company/StaffingManagement";
import RemoteEngagement from "@/components/company/RemoteEngagement";
import RequestsManagement from "@/components/company/RequestsManagement";
import RewardsManagement from "@/components/company/RewardsManagement";
import EmployeeKPISurvey from "@/components/company/EmployeeKPISurvey";
import CompanyAssistantWidget from "@/components/company/CompanyAssistantWidget";

export default function CompanyPortal() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <CompanyDashboard onNavigate={setActiveSection} />;
      case "employees":
        return <EmployeeManagement />;
      case "resources":
        return <ResourcesManagement />;
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
      case "kpi-surveys":
        return <EmployeeKPISurvey onBack={() => setActiveSection("dashboard")} />;
      default:
        return <CompanyDashboard onNavigate={setActiveSection} />;
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
      
      <CompanyAssistantWidget />
    </div>
  );
}