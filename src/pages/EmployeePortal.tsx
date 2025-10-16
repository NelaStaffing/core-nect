import { useState } from "react";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import EmployeeHome from "@/components/employee/EmployeeHome";
import EmployeeSurveys from "@/components/employee/EmployeeSurveys";
import EmployeeFeedback from "@/components/employee/EmployeeFeedback";
import Chatbot from "@/components/employee/Chatbot";

export default function EmployeePortal() {
  const [activePage, setActivePage] = useState("home");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <EmployeeSidebar activePage={activePage} onPageChange={setActivePage} />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activePage === "home" && <EmployeeHome />}
        {activePage === "surveys" && <EmployeeSurveys />}
        {activePage === "feedback" && <EmployeeFeedback />}
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
