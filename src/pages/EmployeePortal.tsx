import { useState } from "react";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import EmployeeHome from "@/components/employee/EmployeeHome";
import EmployeeSurveys from "@/components/employee/EmployeeSurveys";
import EmployeeFeedback from "@/components/employee/EmployeeFeedback";
import EmployeeRequests from "@/components/employee/EmployeeRequests";
import EmployeeAchievements from "@/components/employee/EmployeeAchievements";
import EmployeeRewards from "@/components/employee/EmployeeRewards";
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
        {activePage === "requests" && <EmployeeRequests />}
        {activePage === "achievements" && <EmployeeAchievements />}
        {activePage === "rewards" && <EmployeeRewards />}
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
