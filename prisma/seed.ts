import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { LeadStatus, PolicyStatus } from "../src/generated/prisma/enums";
import { hashPassword } from "../src/shared/lib/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Автострахование",
    subtypes: ["ОСАГО", "КАСКО", "КАСКО Профи"],
  },
  {
    name: "Личное страхование",
    subtypes: ["Активная защита", "Подорожник", "РЕСО-Надежда"],
  },
  {
    name: "Медицина",
    subtypes: [
      "ДМС",
      "Антиклещ",
      "Онко-поддержка",
      "Поберегись",
      "РЕСО-вет",
      "Телемедицина",
      "Авто ДМС",
    ],
  },
  {
    name: "Ипотека",
  },
  {
    name: "Туризм",
  },
  {
    name: "Дом/Дача",
  },
  {
    name: "Квартира",
  },
];

const DEMO_USER = {
  name: "Демо Агент",
  email: "demo@example.com",
  password: "demo12345",
};

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.leadPolicy.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.client.deleteMany();
  await prisma.policySubtype.deleteMany();
  await prisma.policyCategory.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding categories and subtypes...");
  const categoryRecords: Record<string, { id: string; subtypes: Record<string, string> }> = {};
  for (const category of categories) {
    const created = await prisma.policyCategory.create({
      data: {
        name: category.name,
        subtypes: {
          create: category.subtypes?.map((name) => ({ name })),
        },
      },
      include: { subtypes: true },
    });
    categoryRecords[category.name] = {
      id: created.id,
      subtypes: Object.fromEntries(created.subtypes.map((s) => [s.name, s.id])),
    };
  }

  console.log("Seeding demo user...");
  const user = await prisma.user.create({
    data: {
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      password: await hashPassword(DEMO_USER.password),
    },
  });

  console.log("Seeding clients...");
  const clientsData = [
    { name: "Иван Петров", email: "ivan.petrov@example.com", phone: "+7 900 123-45-67", address: "Москва, ул. Ленина, 10" },
    { name: "Мария Сидорова", email: "maria.sidorova@example.com", phone: "+7 901 234-56-78", address: "Санкт-Петербург, Невский пр., 25" },
    { name: "Алексей Смирнов", email: "alexey.smirnov@example.com", phone: "+7 902 345-67-89" },
    { name: "Екатерина Волкова", email: "ekaterina.volkova@example.com", phone: "+7 903 456-78-90" },
    { name: "Дмитрий Кузнецов", email: "dmitry.kuznetsov@example.com", phone: "+7 904 567-89-01" },
    { name: "Ольга Новикова", email: "olga.novikova@example.com", phone: "+7 905 678-90-12" },
  ];

  const clients = [];
  for (const c of clientsData) {
    clients.push(await prisma.client.create({ data: { ...c, userId: user.id } }));
  }

  const auto = categoryRecords["Автострахование"];
  const lichnoe = categoryRecords["Личное страхование"];
  const medicine = categoryRecords["Медицина"];
  const ipoteka = categoryRecords["Ипотека"];
  const turizm = categoryRecords["Туризм"];
  const dom = categoryRecords["Дом/Дача"];
  const kvartira = categoryRecords["Квартира"];

  console.log("Seeding policies...");
  const policies = [
    {
      clientId: clients[0].id,
      number: "OSAGO-2026-0142",
      status: PolicyStatus.ACTIVE,
      categoryId: auto.id,
      subtypeId: auto.subtypes["ОСАГО"],
      startDate: daysFromNow(-350),
      endDate: daysFromNow(15),
      amount: 8500,
    },
    {
      clientId: clients[0].id,
      number: "KASKO-2026-0087",
      status: PolicyStatus.ACTIVE,
      categoryId: auto.id,
      subtypeId: auto.subtypes["КАСКО"],
      startDate: daysFromNow(-100),
      endDate: daysFromNow(265),
      amount: 65000,
    },
    {
      clientId: clients[0].id,
      number: "OSAGO-2025-0091",
      status: PolicyStatus.EXPIRED,
      categoryId: auto.id,
      subtypeId: auto.subtypes["ОСАГО"],
      startDate: daysFromNow(-700),
      endDate: daysFromNow(-335),
      amount: 7800,
    },
    {
      clientId: clients[1].id,
      number: "IPO-2026-0021",
      status: PolicyStatus.ACTIVE,
      categoryId: ipoteka.id,
      subtypeId: null,
      startDate: daysFromNow(-330),
      endDate: daysFromNow(5),
      amount: 42000,
    },
    {
      clientId: clients[1].id,
      number: "DMS-2026-0055",
      status: PolicyStatus.ACTIVE,
      categoryId: medicine.id,
      subtypeId: medicine.subtypes["ДМС"],
      startDate: daysFromNow(-60),
      endDate: daysFromNow(305),
      amount: 38000,
    },
    {
      clientId: clients[2].id,
      number: "KV-2026-0034",
      status: PolicyStatus.ACTIVE,
      categoryId: kvartira.id,
      subtypeId: null,
      startDate: daysFromNow(-200),
      endDate: daysFromNow(165),
      amount: 15000,
    },
    {
      clientId: clients[2].id,
      number: "TUR-2026-0012",
      status: PolicyStatus.CANCELLED,
      categoryId: turizm.id,
      subtypeId: null,
      startDate: daysFromNow(-40),
      endDate: daysFromNow(-10),
      amount: 5200,
    },
    {
      clientId: clients[3].id,
      number: "DOM-2026-0019",
      status: PolicyStatus.ACTIVE,
      categoryId: dom.id,
      subtypeId: null,
      startDate: daysFromNow(-355),
      endDate: daysFromNow(10),
      amount: 27000,
    },
    {
      clientId: clients[4].id,
      number: "LICH-2026-0067",
      status: PolicyStatus.ACTIVE,
      categoryId: lichnoe.id,
      subtypeId: lichnoe.subtypes["Активная защита"],
      startDate: daysFromNow(-90),
      endDate: daysFromNow(275),
      amount: 12000,
    },
    {
      clientId: clients[5].id,
      number: "OSAGO-2025-0203",
      status: PolicyStatus.EXPIRED,
      categoryId: auto.id,
      subtypeId: auto.subtypes["ОСАГО"],
      startDate: daysFromNow(-500),
      endDate: daysFromNow(-135),
      amount: 8000,
    },
  ];

  for (const policy of policies) {
    await prisma.policy.create({ data: policy });
  }

  console.log("Seeding leads...");
  const leadsData = [
    { name: "Сергей Егоров", phone: "+7 906 111-22-33", email: "sergey.egorov@example.com", status: LeadStatus.NEW, notes: "Обратился через сайт, интересуется ОСАГО" },
    { name: "Наталья Морозова", phone: "+7 907 222-33-44", email: null, status: LeadStatus.NEW, notes: "Звонок, перезвонить вечером" },
    { name: "Павел Соколов", phone: "+7 908 333-44-55", email: "pavel.sokolov@example.com", status: LeadStatus.IN_PROGRESS, notes: "Отправлен расчёт КАСКО, ждём решения" },
    { name: "Виктория Лебедева", phone: "+7 909 444-55-66", email: "victoria.lebedeva@example.com", status: LeadStatus.IN_PROGRESS, notes: "Уточняет условия ДМС для семьи" },
    { name: "Андрей Козлов", phone: "+7 910 555-66-77", email: "andrey.kozlov@example.com", status: LeadStatus.WON, notes: "Оформлен полис, готов к конвертации в клиента" },
    { name: "Юлия Никитина", phone: "+7 911 666-77-88", email: null, status: LeadStatus.LOST, notes: "Выбрала другую страховую компанию" },
  ];

  const leads = [];
  for (const lead of leadsData) {
    leads.push(await prisma.lead.create({ data: { ...lead, userId: user.id } }));
  }

  await prisma.leadPolicy.create({
    data: {
      leadId: leads[2].id,
      currentInsurer: "РЕСО-Гарантия",
      categoryId: auto.id,
      subtypeId: auto.subtypes["КАСКО"],
      expiresAt: daysFromNow(20),
    },
  });

  await prisma.leadPolicy.create({
    data: {
      leadId: leads[3].id,
      currentInsurer: "Ингосстрах",
      categoryId: medicine.id,
      subtypeId: medicine.subtypes["ДМС"],
      expiresAt: daysFromNow(45),
    },
  });

  console.log(`Done. Demo login: ${DEMO_USER.email} / ${DEMO_USER.password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
