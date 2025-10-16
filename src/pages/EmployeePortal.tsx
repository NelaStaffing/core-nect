import { useState } from "react";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import EmployeeHome from "@/components/employee/EmployeeHome";
import Chatbot from "@/components/employee/Chatbot";

export default function EmployeePortal() {
  const [activePage, setActivePage] = useState("home");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Content */}
      <main className="flex-1 p-8">
        {activePage === "home" && <EmployeeHome />}
      </main>

      {/* Right Sidebar */}
      <EmployeeSidebar activePage={activePage} onPageChange={setActivePage} />

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
