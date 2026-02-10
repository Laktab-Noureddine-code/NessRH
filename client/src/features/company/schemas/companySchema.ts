import { z } from "zod";
import i18n from "@/config/i18n";

export function createCompanySchema() {
  const t = (key: string, opts?: Record<string, unknown>) => i18n.t(key, opts);

  return z.object({
    company_name: z
      .string()
      .min(1, { message: t("validation.required") })
      .max(255, { message: t("validation.maxLength", { max: 255 }) }),
    ice: z
      .string()
      .min(1, { message: t("validation.required") })
      .max(15, { message: t("validation.maxLength", { max: 15 }) }),
    cnss_employer_number: z
      .string()
      .refine(
        (val) => !val || /^\d+$/.test(val),
        { message: t("validation.numeric") }
      ),
    company_size: z.enum(["1-10", "11-50", "51-100", "101-200", "201-500", "500+"], {
      message: t("validation.required"),
    }),
    address: z
      .string()
      .min(1, { message: t("validation.required") })
      .max(255, { message: t("validation.maxLength", { max: 255 }) }),
    city: z
      .string()
      .min(1, { message: t("validation.required") })
      .max(255, { message: t("validation.maxLength", { max: 255 }) }),
    phone: z
      .string()
      .min(1, { message: t("validation.required") })
      .max(15, { message: t("validation.maxLength", { max: 15 }) }),
    email: z
      .string()
      .min(1, { message: t("validation.required") })
      .email({ message: t("validation.email") })
      .max(255, { message: t("validation.maxLength", { max: 255 }) }),
    logo_url: z
      .string()
      .max(255, { message: t("validation.maxLength", { max: 255 }) })
      .optional()
      .or(z.literal("")),
    status: z.enum(["active", "inactive"], {
      message: t("validation.required"),
    }),
  });
}

export type CompanyData = z.infer<ReturnType<typeof createCompanySchema>>;

// Fields validated per step
const stepFields: Record<number, (keyof CompanyData)[]> = {
  1: ["company_name", "company_size"],
  2: ["ice", "cnss_employer_number"],
  3: ["address", "city", "phone"],
  4: ["email", "logo_url", "status"],
};

export type CompanyErrors = Partial<Record<keyof CompanyData, string>>;

export function validateStep(step: number, data: CompanyData): CompanyErrors {
  const fields = stepFields[step];
  if (!fields) return {};

  const schema = createCompanySchema();
  const result = schema.safeParse(data);
  const errors: CompanyErrors = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof CompanyData;
      if (fields.includes(field) && !errors[field]) {
        errors[field] = issue.message;
      }
    }
  }

  return errors;
}
