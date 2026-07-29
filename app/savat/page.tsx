import CartPageClient from "@/components/CartPageClient";
import { getLocale } from "@/lib/i18n/server";

export const metadata = { title: "Savat — Harrington Academy" };

export default async function CartPage() {
  const locale = await getLocale();
  return <CartPageClient locale={locale} />;
}
