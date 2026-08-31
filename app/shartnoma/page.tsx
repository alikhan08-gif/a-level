import { getLocale } from "@/lib/i18n/server";

export const metadata = { title: "Ommaviy oferta shartnomasi — Harrington Academy" };

const SECTIONS_UZ = [
  {
    title: "1. Umumiy qoidalar",
    body: [
      `1.1. Ushbu ommaviy oferta shartnomasi (keyingi o'rinlarda — "Shartnoma") "Harrington Academy" ta'lim platformasi (keyingi o'rinlarda — "Platforma") tomonidan taqdim etiladigan onlayn ta'lim xizmatlaridan foydalanish tartibini belgilaydi.`,
      `1.2. Platformaga ro'yxatdan o'tish, kursga yozilish yoki to'lovni amalga oshirish orqali foydalanuvchi (keyingi o'rinlarda — "O'quvchi") ushbu Shartnoma shartlarini to'liq va so'zsiz qabul qilgan hisoblanadi (Oʻzbekiston Respublikasi Fuqarolik kodeksining 369-moddasiga muvofiq ommaviy oferta).`,
    ],
  },
  {
    title: "2. Shartnoma predmeti",
    body: [
      `2.1. Platforma O'quvchiga video darslar, test topshiriqlari, yozma ishlar va boshqa o'quv materiallaridan iborat onlayn kursga (A-Level, Attestatsiya yoki Milliy sertifikat yo'nalishlari bo'yicha) kirish huquqini taqdim etadi.`,
      `2.2. Kursning to'liq mazmuni, dasturi va narxi tegishli kurs sahifasida ko'rsatiladi va shartnomaning ajralmas qismi hisoblanadi.`,
    ],
  },
  {
    title: "3. To'lov tartibi",
    body: [
      `3.1. Kursga yozilish uchun to'lov kurs sahifasida ko'rsatilgan narx bo'yicha, Platforma tomonidan taklif etilgan to'lov usullaridan biri orqali amalga oshiriladi.`,
      `3.2. To'lov amalga oshirilgandan so'ng O'quvchiga kurs materiallariga kirish huquqi beriladi.`,
    ],
  },
  {
    title: "4. Tomonlarning huquq va majburiyatlari",
    body: [
      `4.1. Platforma O'quvchiga sifatli o'quv materiallarini, mutaxassis ustozlar tomonidan tayyorlangan video darslarni va o'zlashtirish monitoringini taqdim etishga majbur.`,
      `4.2. O'quvchi taqdim etilgan o'quv materiallarini faqat shaxsiy maqsadlarda foydalanishga, ularni uchinchi shaxslarga tarqatmaslikka majburdir.`,
      `4.3. O'quvchi ro'yxatdan o'tishda haqiqiy ma'lumotlarni taqdim etishi shart.`,
    ],
  },
  {
    title: "5. Mablag'ni qaytarish",
    body: [
      `5.1. Kurs materiallariga kirish ochilgach, to'langan mablag' faqat Platformaning alohida qaroriga binoan, asosli sabablar mavjud bo'lgandagina qaytarilishi mumkin.`,
      `5.2. Mablag'ni qaytarish bo'yicha murojaatlar Platformaning aloqa kanallari orqali ko'rib chiqiladi.`,
    ],
  },
  {
    title: "6. Maxfiylik",
    body: [
      `6.1. Platforma O'quvchining shaxsiy ma'lumotlarini faqat xizmat ko'rsatish maqsadida ishlatadi va uchinchi shaxslarga uzatmaydi, qonunchilikda nazarda tutilgan hollar bundan mustasno.`,
    ],
  },
  {
    title: "7. Yakuniy qoidalar",
    body: [
      `7.1. Platforma ushbu Shartnoma shartlarini bir tomonlama tartibda o'zgartirish huquqiga ega, o'zgarishlar Platforma veb-saytida e'lon qilinadi.`,
      `7.2. Shartnoma yuzasidan kelib chiqishi mumkin bo'lgan nizolar muzokaralar yo'li bilan, kelishuvga erishilmagan taqdirda esa O'zbekiston Respublikasi qonunchiligiga muvofiq hal etiladi.`,
    ],
  },
];

const SECTIONS_EN = [
  {
    title: "1. General provisions",
    body: [
      `1.1. This public offer agreement (the "Agreement") sets out the terms of use of the online education services provided by the "Harrington Academy" platform (the "Platform").`,
      `1.2. By registering on the Platform, enrolling in a course, or making a payment, the user (the "Student") is deemed to have fully and unconditionally accepted the terms of this Agreement.`,
    ],
  },
  {
    title: "2. Subject of the agreement",
    body: [
      `2.1. The Platform grants the Student access to an online course (A-Level, Attestatsiya, or Milliy sertifikat track) consisting of video lessons, quizzes, written assignments, and other learning materials.`,
      `2.2. The full content, curriculum, and price of a course are shown on the relevant course page and form an integral part of this Agreement.`,
    ],
  },
  {
    title: "3. Payment terms",
    body: [
      `3.1. Payment for course enrollment is made at the price shown on the course page, through one of the payment methods offered by the Platform.`,
      `3.2. Once payment is completed, the Student is granted access to the course materials.`,
    ],
  },
  {
    title: "4. Rights and obligations of the parties",
    body: [
      `4.1. The Platform undertakes to provide quality learning materials, video lessons prepared by qualified instructors, and progress monitoring.`,
      `4.2. The Student agrees to use the provided materials for personal purposes only and not to distribute them to third parties.`,
      `4.3. The Student must provide accurate information when registering.`,
    ],
  },
  {
    title: "5. Refunds",
    body: [
      `5.1. Once access to course materials has been granted, paid amounts may be refunded only at the Platform's sole discretion, where reasonable grounds exist.`,
      `5.2. Refund requests are reviewed through the Platform's contact channels.`,
    ],
  },
  {
    title: "6. Confidentiality",
    body: [
      `6.1. The Platform uses the Student's personal data solely to provide its services and does not share it with third parties, except as required by law.`,
    ],
  },
  {
    title: "7. Final provisions",
    body: [
      `7.1. The Platform reserves the right to unilaterally amend the terms of this Agreement; changes will be published on the Platform's website.`,
      `7.2. Any disputes arising from this Agreement will be resolved through negotiation, and failing agreement, in accordance with the legislation of the Republic of Uzbekistan.`,
    ],
  },
];

export default async function ShartnomaPage() {
  const locale = await getLocale();
  const sections = locale === "en" ? SECTIONS_EN : SECTIONS_UZ;

  return (
    <div className="bg-black/[0.015] min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-brand-navy mb-2">
          {locale === "en" ? "Public Offer Agreement" : "Ommaviy oferta shartnomasi"}
        </h1>
        <p className="text-brand-navy/50 text-sm mb-8">Harrington Academy</p>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-black/10 bg-white p-6">
              <h2 className="font-bold text-brand-navy mb-3">{section.title}</h2>
              <div className="space-y-2">
                {section.body.map((p, i) => (
                  <p key={i} className="text-sm text-brand-navy/70 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
