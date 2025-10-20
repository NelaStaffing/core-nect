import { useState } from "react";
import Navbar from "@/components/Navbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import CompanyDashboard from "@/components/company/CompanyDashboard";
import EmployeeManagement from "@/components/company/EmployeeManagement";
import EmployeeKPISurvey from "@/components/company/EmployeeKPISurvey";
import ResourcesManagement from "@/components/company/ResourcesManagement";
import StaffingManagement from "@/components/company/StaffingManagement";
import RemoteEngagement from "@/components/company/RemoteEngagement";
import RequestsManagement from "@/components/company/RequestsManagement";
import RewardsManagement from "@/components/company/RewardsManagement";
import SurveyManagement from "@/components/company/SurveyManagement";
import CompanyMetrics from "@/components/company/CompanyMetrics";
import { Card } from "@/components/ui/card";

export default function AdminPortal() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <CompanyDashboard />;
      case "employees":
        return <EmployeeManagement />;
      case "kpi-surveys":
        return <EmployeeKPISurvey onBack={() => setActiveSection("dashboard")} />;
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
      case "system":
        return (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">System Settings</h2>
            <p className="text-muted-foreground">System-wide configuration and administration tools.</p>
          </Card>
        );
      default:
        return <CompanyDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <AdminSidebar 
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
