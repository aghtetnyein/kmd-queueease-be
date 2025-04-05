import { PrismaClient } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';

const prisma = new PrismaClient();

function getHashedPassword(password: string) {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
}

// Helper function to clear all data
async function clearDatabase() {
  const models = [
    'meal',
    'order',
    'queue',
    'table',
    'staff',
    'restaurant',
    'customer',
    'admin',
  ];
  for (const model of models) {
    await prisma[model].deleteMany();
  }
}

// Create admin
async function createAdmin() {
  return await prisma.admin.create({
    data: {
      phoneNo: '0621481906',
      name: 'Sa Aung Htet Nyein',
      password: getHashedPassword('User@123'),
    },
  });
}

// Create restaurant
async function createRestaurant(adminId: string) {
  return await prisma.restaurant.create({
    data: {
      name: 'Brewery',
      slug: 'brewery',
      location: 'Bangkok, Thailand',
      openDays: [1, 2, 3, 4, 5],
      openHour: '10:00',
      closeHour: '22:00',
      slotDurationInMin: 60,
      adminId,
    },
  });
}

// Create tables
async function createTables(restaurantId: string) {
  const tablesData = [
    { tableNo: 'A01', tableSize: 4 },
    { tableNo: 'A02', tableSize: 2 },
    { tableNo: 'A03', tableSize: 6 },
  ];

  const tables = [];
  for (const data of tablesData) {
    tables.push(
      await prisma.table.create({
        data: { ...data, restaurantId },
      }),
    );
  }
  return tables;
}

async function main() {
  await clearDatabase();
  // const admin = await createAdmin();
  // const restaurant = await createRestaurant(admin.id);
  // const tables = await createTables(restaurant.id);

  return;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
