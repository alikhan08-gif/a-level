import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DIRECTIONS = ["A_LEVEL", "MILLIY_SERTIFIKAT", "ATTESTATSIYA"] as const;
const SUBJECTS = ["KIMYO", "BIOLOGIYA", "MATH"] as const;

const SUBJECT_TITLES: Record<(typeof SUBJECTS)[number], string> = {
  KIMYO: "Kimyo",
  BIOLOGIYA: "Biologiya",
  MATH: "Math",
};

const SUBJECT_TITLES_EN: Record<(typeof SUBJECTS)[number], string> = {
  KIMYO: "Chemistry",
  BIOLOGIYA: "Biology",
  MATH: "Math",
};

const DIRECTION_TITLES: Record<(typeof DIRECTIONS)[number], string> = {
  A_LEVEL: "A-Level",
  MILLIY_SERTIFIKAT: "Milliy sertifikat",
  ATTESTATSIYA: "Attestatsiya",
};

const DIRECTION_TITLES_EN: Record<(typeof DIRECTIONS)[number], string> = {
  A_LEVEL: "A-Level",
  MILLIY_SERTIFIKAT: "National Certificate",
  ATTESTATSIYA: "Attestation",
};

async function main() {
  console.log("Seeding...");

  for (const direction of DIRECTIONS) {
    for (const subject of SUBJECTS) {
      const titleUz = `${SUBJECT_TITLES[subject]} — ${DIRECTION_TITLES[direction]}`;
      const titleEn = `${SUBJECT_TITLES_EN[subject]} — ${DIRECTION_TITLES_EN[direction]}`;
      const descriptionUz = `${DIRECTION_TITLES[direction]} yo'nalishi bo'yicha ${SUBJECT_TITLES[subject]} fanidan tayyorlov kursi.`;
      const descriptionEn = `A ${SUBJECT_TITLES_EN[subject]} prep course for the ${DIRECTION_TITLES_EN[direction]} track.`;

      const course = await prisma.course.upsert({
        where: { direction_subject: { direction, subject } },
        update: { titleEn, descriptionEn },
        create: {
          direction,
          subject,
          title: titleUz,
          titleEn,
          description: descriptionUz,
          descriptionEn,
          price: 150000,
          telegramBotLink: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME ?? "harrington_academy_bot"}`,
        },
      });

      const existingModules = await prisma.module.count({ where: { courseId: course.id } });
      if (existingModules === 0) {
        for (let m = 1; m <= 4; m++) {
          const module = await prisma.module.create({
            data: { courseId: course.id, order: m, title: `${m}-modul` },
          });
          for (let l = 1; l <= 3; l++) {
            const lesson = await prisma.lesson.create({
              data: {
                moduleId: module.id,
                order: l,
                title: `${m}.${l} — dars`,
                youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              },
            });
            await prisma.quiz.create({
              data: {
                lessonId: lesson.id,
                questions: {
                  create: [
                    {
                      text: "Namuna savol 1?",
                      optionsJson: JSON.stringify(["A", "B", "C", "D"]),
                      correctOption: 0,
                    },
                    {
                      text: "Namuna savol 2?",
                      optionsJson: JSON.stringify(["A", "B", "C", "D"]),
                      correctOption: 1,
                    },
                  ],
                },
              },
            });
          }
        }
      }
    }
  }

  const bookCount = await prisma.book.count();
  if (bookCount === 0) {
    for (const subject of SUBJECTS) {
      for (let i = 1; i <= 8; i++) {
        await prisma.book.create({
          data: {
            subject,
            title: `${SUBJECT_TITLES_EN[subject]} AS & A-Level Paper ${i}`,
            titleEn: `${SUBJECT_TITLES_EN[subject]} AS & A-Level Paper ${i}`,
            description: `${SUBJECT_TITLES[subject]} fanidan ${i}-darslik.`,
            descriptionEn: `Textbook ${i} for ${SUBJECT_TITLES_EN[subject]}.`,
            price: 150000,
          },
        });
      }
    }
  } else {
    const booksMissingEn = await prisma.book.findMany({ where: { titleEn: null } });
    for (const book of booksMissingEn) {
      const match = book.title.match(/kitob (\d+)$/);
      const index = match ? match[1] : "1";
      await prisma.book.update({
        where: { id: book.id },
        data: {
          titleEn: `${SUBJECT_TITLES_EN[book.subject as (typeof SUBJECTS)[number]]} — book ${index}`,
          descriptionEn: `Textbook ${index} for ${SUBJECT_TITLES_EN[book.subject as (typeof SUBJECTS)[number]]}.`,
        },
      });
    }
  }

  const adminUsername = "admin";
  const adminExists = await prisma.adminUser.findUnique({ where: { username: adminUsername } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_HOTKEY_PASSWORD ?? "change-me-admin", 10);
    await prisma.adminUser.create({ data: { username: adminUsername, passwordHash } });
    console.log(`Admin user created: username=${adminUsername}`);
  }

  const demoPhone = "+998900000000";
  let demoUser = await prisma.user.findUnique({ where: { phone: demoPhone } });
  if (!demoUser) {
    const passwordHash = await bcrypt.hash("demo12345", 10);
    demoUser = await prisma.user.create({
      data: { firstName: "Demo", lastName: "Talaba", phone: demoPhone, passwordHash },
    });
    console.log(`Demo student created: phone=${demoPhone} password=demo12345`);
  }

  const demoCourse = await prisma.course.findUnique({
    where: { direction_subject: { direction: "A_LEVEL", subject: "KIMYO" } },
  });
  if (demoCourse) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: demoUser.id, courseId: demoCourse.id } },
      update: {},
      create: { userId: demoUser.id, courseId: demoCourse.id, status: "ACTIVE" },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
