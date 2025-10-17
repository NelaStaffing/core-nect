import { useState } from "react";
import Navbar from "@/components/Navbar";
import CompanySidebar from "@/components/company/CompanySidebar";
import EmployeeManagement from "@/components/company/EmployeeManagement";
import SurveyManagement from "@/components/company/SurveyManagement";
import CompanyMetrics from "@/components/company/CompanyMetrics";

export default function CompanyPortal() {
  const [activeSection, setActiveSection] = useState("employees");

  const renderContent = () => {
    switch (activeSection) {
      case "employees":
        return <EmployeeManagement />;
      case "surveys":
        return <SurveyManagement />;
      case "metrics":
        return <CompanyMetrics />;
      default:
        return <EmployeeManagement />;
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