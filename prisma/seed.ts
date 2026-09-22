import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_TEMPLATES } from "../src/lib/domain/templates";
import { TASK_CHAIN } from "../src/lib/domain/tasks";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await hash(process.env.ADMIN_PASSWORD ?? "admin1234", 10);
  const memberPass = await hash("member1234", 10);
  const viewerPass = await hash("viewer1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sgups.local" },
    update: {},
    create: { name: "Руководитель", email: "admin@sgups.local", passwordHash: adminPass, role: "ADMIN" },
  });
  const member = await prisma.user.upsert({
    where: { email: "member@sgups.local" },
    update: {},
    create: { name: "Анна Членцентра", email: "member@sgups.local", passwordHash: memberPass, role: "MEMBER" },
  });
  await prisma.user.upsert({
    where: { email: "viewer@sgups.local" },
    update: {},
    create: { name: "Смотрящий", email: "viewer@sgups.local", passwordHash: viewerPass, role: "VIEWER" },
  });

  let event = await prisma.event.findFirst({ where: { name: "День первокурсника", deletedAt: null } });
  if (!event) {
    event = await prisma.event.create({
      data: {
        name: "День первокурсника",
        startsAt: new Date("2026-09-01T12:00:00+07:00"),
        location: "СГУПС",
        status: "ACTIVE",
      },
    });
  }
  await prisma.appSettings.upsert({
    where: { id: "default" },
    update: { currentEventId: event.id },
    create: { id: "default", currentEventId: event.id },
  });

  const existingContact = await prisma.contact.findFirst({ where: { brand: "Колибри Кофе", deletedAt: null } });
  const contact =
    existingContact ??
    (await prisma.contact.create({
      data: {
        brand: "Колибри Кофе",
        personName: "Ирина Соколова",
        position: "маркетинг",
        category: "FOOD",
        telegram: "@kolibri",
        email: "hi@kolibri.example",
        phone: "+7 383 000-00-00",
      },
    }));
  if (!existingContact) {
    await prisma.interaction.create({
      data: { contactId: contact.id, userId: member.id, body: "Написали в Telegram, ждут КП." },
    });
  }

  if (!(await prisma.pipelineLead.findFirst({ where: { brand: "Колибри Кофе", deletedAt: null } }))) {
    const lead = await prisma.pipelineLead.create({
      data: {
        contactId: contact.id,
        ownerId: member.id,
        category: "FOOD",
        product: "Кофе и десерты",
        brand: "Колибри Кофе",
        links: "https://t.me/kolibri",
        status: "AGREED",
        comment: "Согласились на бартер",
      },
    });

    const sponsorship = await prisma.sponsorship.create({
      data: {
        eventId: event.id,
        contactId: contact.id,
        leadId: lead.id,
        finderId: member.id,
        category: "FOOD",
        product: "Кофе и десерты",
        brand: "Колибри Кофе",
        unitPrice: 500,
        quantity: 40,
        total: 20000,
        hasLogo: true,
        hasPostText: true,
        adFormat: "BOTH",
        guestName: "Ирина Соколова",
        needsTable: true,
      },
    });
    await prisma.task.createMany({
      data: TASK_CHAIN.map((step) => ({
        sponsorshipId: sponsorship.id,
        eventId: event.id,
        assigneeId: member.id,
        stage: step.stage,
        title: step.title,
        sortOrder: step.sortOrder,
        done: step.sortOrder === 0,
      })),
    });
    await prisma.reminder.create({
      data: {
        type: "THANK_YOU",
        title: "Отправь благодарственное письмо",
        dueAt: new Date(Date.now() + 86400000),
        userId: member.id,
        sponsorshipId: sponsorship.id,
        eventId: event.id,
      },
    });
  }
  if ((await prisma.messageTemplate.count()) === 0) {
    for (const t of DEFAULT_TEMPLATES) {
      await prisma.messageTemplate.create({ data: t });
    }
  }
  await prisma.auditLog.create({
    data: { userId: admin.id, action: "seed", entity: "App", entityId: "default" },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
