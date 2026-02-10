import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompanyData, CompanyErrors } from "../schemas/companySchema";

interface CompanyFormsProps {
  step: number;
  data: CompanyData;
  errors: CompanyErrors;
  updateField: (field: string, value: string) => void;
  companySizes: string[];
  statusOptions: string[];
}

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition";
const inputErrorClass =
  "w-full px-4 py-2.5 border border-red-400 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition";

function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

function CompanyForms({ step, data, errors, updateField, companySizes, statusOptions }: CompanyFormsProps) {
  const { t } = useTranslation();

  /* ───── Step 1: Company Name, Domain & Size ───── */
  if (step === 1) {
    return (
      <div className="lg:w-[55%] bg-gray-100 p-3 rounded-2xl">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {t("company.step1.formTitle")}
          </h2>

          <div className="mb-5">
            <label className="block text-sm text-gray-500 mb-1.5">
              {t("company.step1.companyName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.company_name}
              onChange={(e) => updateField("company_name", e.target.value)}
              placeholder={t("company.step1.placeholderName")}
              className={errors.company_name ? inputErrorClass : inputClass}
            />
            <ErrorMessage message={errors.company_name} />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("company.step1.companySizeTitle")}
          </h3>

          <div className="grid grid-cols-4 gap-3">
            {companySizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateField("company_size", size)}
                className={`relative px-4 py-2.5 rounded-lg border text-sm font-medium transition cursor-pointer ${
                  data.company_size === size
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                {size}
                {data.company_size === size && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5L4.5 7.5L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ───── Step 2: Legal / Registration Details ───── */
  if (step === 2) {
    return (
      <div className="lg:w-[55%]">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {t("company.step2.formTitle")}
          </h2>

          <div className="mb-5">
            <label className="block text-sm text-gray-500 mb-1.5">
              {t("company.step2.ice")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.ice}
              onChange={(e) => updateField("ice", e.target.value)}
              placeholder={t("company.step2.placeholderIce")}
              className={errors.ice ? inputErrorClass : inputClass}
            />
            <ErrorMessage message={errors.ice} />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-gray-500 mb-1.5">
              {t("company.step2.cnssEmployerNumber")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.cnss_employer_number}
              onChange={(e) => updateField("cnss_employer_number", e.target.value)}
              placeholder={t("company.step2.placeholderCnss")}
              className={errors.cnss_employer_number ? inputErrorClass : inputClass}
            />
            <ErrorMessage message={errors.cnss_employer_number} />
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-400">
            <Info size={14} className="text-gray-400 shrink-0" />
            {t("company.step2.hint")}
          </p>
        </div>
      </div>
    );
  }

  /* ───── Step 3: Address & Contact ───── */
  if (step === 3) {
    return (
      <div className="lg:w-[55%]">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {t("company.step3.formTitle")}
          </h2>

          <div className="mb-5">
            <label className="block text-sm text-gray-500 mb-1.5">
              {t("company.step3.address")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder={t("company.step3.placeholderAddress")}
              className={errors.address ? inputErrorClass : inputClass}
            />
            <ErrorMessage message={errors.address} />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-gray-500 mb-1.5">
              {t("company.step3.city")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder={t("company.step3.placeholderCity")}
              className={errors.city ? inputErrorClass : inputClass}
            />
            <ErrorMessage message={errors.city} />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-gray-500 mb-1.5">
              {t("company.step3.phone")} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder={t("company.step3.placeholderPhone")}
              className={errors.phone ? inputErrorClass : inputClass}
            />
            <ErrorMessage message={errors.phone} />
          </div>
        </div>
      </div>
    );
  }

  /* ───── Step 4: Email, Logo & Status ───── */
  if (step === 4) {
    return (
      <div className="lg:w-[55%]">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {t("company.step4.formTitle")}
          </h2>

          <div className="mb-5">
            <label className="block text-sm text-gray-500 mb-1.5">
              {t("company.step4.email")} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder={t("company.step4.placeholderEmail")}
              className={errors.email ? inputErrorClass : inputClass}
            />
            <ErrorMessage message={errors.email} />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-gray-500 mb-1.5">
              {t("company.step4.logoUrl")}
            </label>
            <input
              type="url"
              value={data.logo_url}
              onChange={(e) => updateField("logo_url", e.target.value)}
              placeholder={t("company.step4.placeholderLogo")}
              className={errors.logo_url ? inputErrorClass : inputClass}
            />
            <ErrorMessage message={errors.logo_url} />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-gray-500 mb-1.5">
              {t("company.step4.status")} <span className="text-red-500">*</span>
            </label>
            <Select value={data.status} onValueChange={(v) => updateField("status", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("company.step4.placeholderStatus")} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt} value={opt} className="capitalize">
                    {t(`company.step4.status${opt.charAt(0).toUpperCase() + opt.slice(1)}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default CompanyForms;
