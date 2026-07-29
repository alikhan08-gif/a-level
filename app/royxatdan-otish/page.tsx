import RoyxatdanOtishForm from "@/components/RoyxatdanOtishForm";
import { getLocale } from "@/lib/i18n/server";

export default async function RoyxatdanOtishPage() {
  const locale = await getLocale();
  return <RoyxatdanOtishForm locale={locale} />;
}
