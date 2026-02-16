import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/shared/DashboardNavbar";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col ">
        <DashboardNavbar />
        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="bg-white rounded-lg shadow-sm p-4 min-h-full ">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
