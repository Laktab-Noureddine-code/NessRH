import { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../../../components/shared/Navbar";
import CompanyForms from "../components/CompanyForms";
import { validateStep, type CompanyErrors } from "../schemas/companySchema";
import api from "@/api/axios";

const companySizes = ["1-10", "11-50", "51-100", "101-200", "201-500", "500+"];
const statusOptions = ["active", "inactive"];

function CreateCompany() {
  const { t } = useTranslation();
  
  const [companyData, setCompanyData] = useState({
    company_name: "",
    ice: "",
    cnss_employer_number: "",
    company_size: "1-10",
    address: "",
    city: "",
    phone: "",
    email: "",
    logo_url: "",
    status: "active",
  });

  const updateField = (field: string, value: string) => {
    setCompanyData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };
  const [errors, setErrors] = useState<CompanyErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleContinue = async () => {
    const stepErrors = validateStep(currentStep, companyData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});

    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
    } else {
      console.log('Submitting company data:', companyData);
      await api.post("/api/companies", companyData);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Left Side */}
          <div className="lg:w-[45%] flex flex-col justify-between">
            <div>
              {/* Step Indicators */}
              <div className="flex gap-2 mb-4">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 ${
                      i < currentStep ? "bg-teal-600" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Step Counter */}
              <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-6">
                {t("company.stepOf", {
                  current: currentStep,
                  total: totalSteps,
                })}
              </p>

              {/* Heading */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {t(`company.step${currentStep}.title`)}
              </h1>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed">
                {t(`company.step${currentStep}.description`)}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-10">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-8 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("company.goBack")}
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="px-8 py-2.5 bg-black hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition cursor-pointer"
              >
                {currentStep === totalSteps
                  ? t("company.complete")
                  : t("company.continue")}
              </button>
            </div>
          </div>

          {/* Right Side - Form */}
          <CompanyForms
            step={currentStep}
            data={companyData}
            errors={errors}
            updateField={updateField}
            companySizes={companySizes}
            statusOptions={statusOptions}
          />
        </div>
      </div>
    </div>
  );
}

export default CreateCompany;
