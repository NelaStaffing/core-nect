import { useState } from "react";
import Navbar from "@/components/Navbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import EmployeeManagement from "@/components/company/EmployeeManagement";
import SurveyManagement from "@/components/company/SurveyManagement";
import CompanyMetrics from "@/components/company/CompanyMetrics";
import CreateUserForm from "@/components/admin/CreateUserForm";
import { Card } from "@/components/ui/card";

export default function AdminPortal() {
  const [activeSection, setActiveSection] = useState("users");

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <EmployeeManagement />;
      case "create-user":
        return <CreateUserForm />;
      case "companies":
        return (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Company List</h2>
            <p className="text-muted-foreground">View and manage all registered companies.</p>
          </Card>
        );
      case "surveys":
        return <SurveyManagement />;
      case "metrics":
        return <CompanyMetrics />;
      case "kpi-cycles":
        return (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">KPI and Cycles</h2>
            <p className="text-muted-foreground">Manage KPI tracking cycles and quarterly timelines.</p>
          </Card>
        );
      case "system":
        return (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">System-wide configuration and administration tools.</p>
          </Card>
        );
      default:
        return <EmployeeManagement />;
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
