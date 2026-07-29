import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminLoginPage() {
  const locale = await getLocale();
  return <AdminLoginForm locale={locale} />;
}
