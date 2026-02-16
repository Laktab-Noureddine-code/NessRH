import { useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/features/employees/components/PageHeader";
import AddDepartmentPanel from "../components/AddDepartmentPanel";

function Departments() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Manage your company departments"
        actions={
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#121828] px-4 py-2 text-sm font-medium text-white hover:bg-[#121828]/90"
          >
            <Plus className="size-4" />
            Add Department
          </button>
        }
      />

      <AddDepartmentPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}

export default Departments;