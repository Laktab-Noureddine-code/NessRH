import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "@/api/axios";

type Employee = {
  id: number;
  full_name: string;
};

type AddDepartmentPanelProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function AddDepartmentPanel({ open, onClose, onSuccess }: AddDepartmentPanelProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [managerId, setManagerId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      api.get("/api/employees").then((res) => {
        const data = res.data;
        setEmployees(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
      });
    }
  }, [open]);

  const resetForm = () => {
    setName("");
    setCode("");
    setManagerId("");
    setIsActive(true);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await api.post("/api/departments", {
        name,
        code,
        manager_id: managerId || null,
        is_active: isActive,
      });
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Add Department</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="size-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 space-y-5 p-6">
              {/* Name */}
              <div>
                <label className="form-label">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Human Resources"
                  className={errors.name ? "form-error" : "form-input"}
                  required
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
              </div>

              {/* Code */}
              <div>
                <label className="form-label">
                  Department Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. HR"
                  className={errors.code ? "form-error" : "form-input"}
                  required
                />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code[0]}</p>}
              </div>

              {/* Manager */}
              <div>
                <label className="form-label">Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className={errors.manager_id ? "form-error" : "form-input"}
                >
                  <option value="">No manager</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
                {errors.manager_id && (
                  <p className="mt-1 text-xs text-red-500">{errors.manager_id[0]}</p>
                )}
              </div>

              {/* Active */}
              <div>
                <label className="form-label">Status</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#121828] px-4 py-2 text-sm font-medium text-white hover:bg-[#121828]/90 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Department"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
