import { PrismaClient } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Define an array of model names in the order they should be cleared
  const models = [
    'notification',
    'booking',
    'waitlist',
    'meal',
    'order',
    'queue',
    'table',
    'staff',
    'resource',
    'restaurant',
    'customer',
    'admin',
  ];
  for (const model of models) {
    await prisma[model].deleteMany();
  }

  function getHashedPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  // Create a Super Admin
  const superAdmin = await prisma.admin.create({
    data: {
      email: 'admin@queueease.com',
      name: 'Super Admin',
      password: getHashedPassword('password'),
    },
  });

  // Create a Customer
  const customer = await prisma.customer.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: getHashedPassword('password'),
    },
  });

  // Create a Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'The Great Restaurant',
      location: '123 Main St',
      qrCode: 'some-qr-code',
      sharedLink: 'http://example.com/restaurant',
    },
  });

  // Create Resources
  const resource = await prisma.resource.create({
    data: {
      restaurantId: restaurant.id,
    },
  });

  // Create a Table
  const table = await prisma.table.create({
    data: {
      tableNo: 'A1',
      tableSize: 4,
      resourceId: resource.id,
    },
  });

  // Create Staff
  const staff = await prisma.staff.create({
    data: {
      name: 'Jane Smith',
      resourceId: resource.id,
    },
  });

  // Create a Queue
  const queue = await prisma.queue.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer.id,
      status: 'WAITLIST',
      progressStatus: 'PENDING',
      partySize: 2,
      waitTime: 15,
      position: 1,
    },
  });

  // Create a Booking
  const booking = await prisma.booking.create({
    data: {
      queueId: queue.id,
      partySize: 2,
      waitTime: 15,
      position: 1,
    },
  });

  // Create a Waitlist
  const waitlist = await prisma.waitlist.create({
    data: {
      queueId: queue.id,
      partySize: 2,
      waitTime: 15,
      position: 1,
    },
  });

  const order = await prisma.order.create({
    data: {
      queueId: queue.id,
      tableId: table.id,
      customerId: customer.id,
      restaurantId: restaurant.id,
    },
  });

  // Create Meals
  const meal1 = await prisma.meal.create({
    data: {
      name: 'Pasta',
      price: 12.99,
      resourceId: resource.id,
    },
  });

  const meal2 = await prisma.meal.create({
    data: {
      name: 'Pizza',
      price: 15.99,
      resourceId: resource.id,
    },
  });

  // Create OrderMeals to associate meals with the order
  await prisma.orderMeal.create({
    data: {
      orderId: order.id,
      mealId: meal1.id,
      quantity: 1,
    },
  });

  await prisma.orderMeal.create({
    data: {
      orderId: order.id,
      mealId: meal2.id,
      quantity: 2,
    },
  });

  // Create a Notification
  const notification = await prisma.notification.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer.id,
      message: 'Your table is ready!',
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
