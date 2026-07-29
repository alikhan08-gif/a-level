import KirishForm from "@/components/KirishForm";
import { getLocale } from "@/lib/i18n/server";

export default async function KirishPage() {
  const locale = await getLocale();
  return <KirishForm locale={locale} />;
}
