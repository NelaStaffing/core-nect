import { useState } from "react";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import EmployeeHome from "@/components/employee/EmployeeHome";
import EmployeeSurveys from "@/components/employee/EmployeeSurveys";
import EmployeeFeedback from "@/components/employee/EmployeeFeedback";
import EmployeeRequests from "@/components/employee/EmployeeRequests";
import EmployeeAchievements from "@/components/employee/EmployeeAchievements";
import EmployeeRewards from "@/components/employee/EmployeeRewards";
import Chatbot from "@/components/employee/Chatbot";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmployeePortal() {
  const [activePage, setActivePage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePageChange = (page: string) => {
    setActivePage(page);
    setMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary">Employee Portal</h2>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <EmployeeSidebar activePage={activePage} onPageChange={handlePageChange} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <EmployeeSidebar activePage={activePage} onPageChange={setActivePage} />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {activePage === "home" && <EmployeeHome />}
        {activePage === "surveys" && <EmployeeSurveys />}
        {activePage === "feedback" && <EmployeeFeedback />}
        {activePage === "requests" && <EmployeeRequests />}
        {activePage === "achievements" && <EmployeeAchievements />}
        {activePage === "rewards" && <EmployeeRewards />}
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
