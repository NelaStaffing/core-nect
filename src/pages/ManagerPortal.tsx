import { useState } from "react";
import Navbar from "@/components/Navbar";
import ManagerSidebar from "@/components/manager/ManagerSidebar";
import CompanyDashboard from "@/components/company/CompanyDashboard";
import EmployeeManagement from "@/components/company/EmployeeManagement";
import EmployeeKPISurvey from "@/components/company/EmployeeKPISurvey";
import ResourcesManagement from "@/components/company/ResourcesManagement";
import RemoteEngagement from "@/components/company/RemoteEngagement";
import RequestsManagement from "@/components/company/RequestsManagement";
import SurveyManagement from "@/components/company/SurveyManagement";
import CompanyMetrics from "@/components/company/CompanyMetrics";

export default function ManagerPortal() {
  const [activeSection, setActiveSection] = useState("employees");

  const renderContent = () => {
    switch (activeSection) {
      case "employees":
        return <EmployeeManagement />;
      case "kpi-surveys":
        return <EmployeeKPISurvey onBack={() => setActiveSection("employees")} />;
      case "requests":
        return <RequestsManagement />;
      case "metrics":
        return <CompanyMetrics />;
      case "engagement":
        return <RemoteEngagement />;
      case "surveys":
        return <SurveyManagement />;
      default:
        return <EmployeeManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <ManagerSidebar 
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
