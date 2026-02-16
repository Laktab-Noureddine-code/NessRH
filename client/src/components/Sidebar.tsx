import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import CompanyLogo from "./shared/CompanyLogo";
import {
  CalendarOff,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  LayoutGrid,
  Settings,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import type React from "react";

type Route = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  link: string;
  subs?: {
    title: string;
    link: string;
  }[];
};

const dashboardRoutes: Route[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <LayoutDashboard className="size-4 text-app" />,
    link: "/dashboard",
  },
  {
    id: "employees",
    title: "Employees",
    icon: <Users className="size-4 text-app" />,
    link: "/dashboard/manage-employees",
    subs: [{ title: "Manage Employees", link: "/dashboard/manage-employees" }],
  },
  {
    id: "Departments",
    title: "Departments",
    icon: <ClipboardList className="size-4 text-app" />,
    link: "/dashboard/departments",
    subs: [
      { title: "Manage Departments", link: "/dashboard/departments/manage" },
      { title: "Add Department", link: "/dashboard/departments/add" },
    ],
  },
  {
    id: "checklist",
    title: "Checklist",
    icon: <CheckSquare className="size-4 text-app" />,
    link: "/dashboard/checklist",
    subs: [
      { title: "Onboarding", link: "/dashboard/checklist/onboarding" },
      { title: "Offboarding", link: "/dashboard/checklist/offboarding" },
    ],
  },
  {
    id: "time-off",
    title: "Time Off",
    icon: <CalendarOff className="size-4 text-app" />,
    link: "/dashboard/time-off",
    subs: [
      { title: "Requests", link: "/dashboard/time-off/requests" },
      { title: "Balances", link: "/dashboard/time-off/balances" },
    ],
  },
  {
    id: "attendance",
    title: "Attendance",
    icon: <UserCheck className="size-4 text-app" />,
    link: "/dashboard/attendance",
    subs: [
      { title: "Daily Log", link: "/dashboard/attendance/daily" },
      { title: "Reports", link: "/dashboard/attendance/reports" },
    ],
  },
  {
    id: "payroll",
    title: "Payroll",
    icon: <DollarSign className="size-4 text-app" />,
    link: "/dashboard/payroll",
    subs: [
      { title: "Payslips", link: "/dashboard/payroll/payslips" },
      { title: "Run Payroll", link: "/dashboard/payroll/run" },
    ],
  },
  {
    id: "performance",
    title: "Performance",
    icon: <TrendingUp className="size-4 text-app" />,
    link: "/dashboard/performance",
    subs: [
      { title: "Reviews", link: "/dashboard/performance/reviews" },
      { title: "Goals", link: "/dashboard/performance/goals" },
    ],
  },
  {
    id: "recruitment",
    title: "Recruitment",
    icon: <ClipboardList className="size-4 text-app" />,
    link: "/dashboard/recruitment",
    subs: [
      { title: "Job Postings", link: "/dashboard/recruitment/jobs" },
      { title: "Candidates", link: "/dashboard/recruitment/candidates" },
    ],
  },
];

const footerRoutes: Route[] = [
  {
    id: "help-center",
    title: "Help Center",
    icon: <CircleHelp className="size-4 text-app" />,
    link: "/dashboard/help",
  },
  {
    id: "settings",
    title: "Setting",
    icon: <Settings className="size-4 text-app" />,
    link: "/dashboard/settings",
  },
];

function NavItem({ route }: { route: Route }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const hasSubRoutes = !!route.subs?.length;
  const isDashboard = route.id === "dashboard";
  const isActive =
    location.pathname === route.link ||
    route.subs?.some((s) => location.pathname === s.link);

  if (isDashboard) {
    return (
      <li>
        <Link
          to={route.link}
          className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition-all"
        >
          <span className="text-sm font-semibold">{route.title}</span>
          <LayoutGrid className="size-4 opacity-80" />
        </Link>
      </li>
    );
  }

  if (hasSubRoutes) {
    return (
      <li>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center rounded-lg px-2 py-2 transition-colors",
            isActive
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {route.icon}
          <span className="ml-2 flex-1 text-left text-sm font-medium">
            {route.title}
          </span>
          {open ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
        {open && (
          <ul className="my-1 ml-3.5 space-y-0.5 border-l border-border pl-3">
            {route.subs?.map((sub) => (
              <li key={sub.title}>
                <Link
                  to={sub.link}
                  className={cn(
                    "flex items-center rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                    location.pathname === sub.link
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {sub.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        to={route.link}
        className={cn(
          "flex items-center rounded-lg px-2 py-2 transition-colors",
          isActive
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        {route.icon}
        <span className="ml-2 text-sm font-medium">{route.title}</span>
      </Link>
    </li>
  );
}

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center px-3 py-4">
        <CompanyLogo isCollapsed={false} />
      </div>

      {/* Main navigation */}
      <nav className="sidebar-nav flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-1">
          {dashboardRoutes.map((route) => (
            <NavItem key={route.id} route={route} />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-2 pb-4 pt-2">
        <ul className="space-y-1">
          {footerRoutes.map((route) => (
            <NavItem key={route.id} route={route} />
          ))}
        </ul>
      </div>
    </aside>
  );
}
