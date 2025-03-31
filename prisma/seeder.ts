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
    'notification',
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
      name: 'Super Admin',
      password: getHashedPassword('$0meTimes1999'),
    },
  });
}

// Create customers
async function createCustomers() {
  const customersData = [
    {
      phoneNo: '0621481902',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: getHashedPassword('$0meTimes1999'),
      isAccountCreated: true,
    },
    {
      phoneNo: '0621482332',
      name: 'Berry',
      email: null,
      password: null,
      isAccountCreated: false,
    },
    {
      phoneNo: '0621483443',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      password: getHashedPassword('Wilson@2024'),
      isAccountCreated: true,
    },
    {
      phoneNo: '0621484554',
      name: 'Mike Chen',
      email: null,
      password: null,
      isAccountCreated: false,
    },
    {
      phoneNo: '0621485665',
      name: 'Emma Thompson',
      email: 'emma.t@example.com',
      password: getHashedPassword('EmmaT@2024'),
      isAccountCreated: true,
    },
    {
      phoneNo: '0621486776',
      name: 'Alex Rodriguez',
      email: 'alex.r@example.com',
      password: getHashedPassword('Alex@2024'),
      isAccountCreated: true,
    },
    {
      phoneNo: '0621487887',
      name: 'Lisa Kumar',
      email: null,
      password: null,
      isAccountCreated: false,
    },
  ];

  const customers = [];
  for (const data of customersData) {
    customers.push(await prisma.customer.create({ data }));
  }
  return customers;
}

// Create restaurant
async function createRestaurant(adminId: string) {
  return await prisma.restaurant.create({
    data: {
      name: 'The Great Restaurant',
      location: '123 Main St',
      qrCode: 'some-qr-code',
      sharedLink: 'http://example.com/restaurant',
      openDays: [1, 2, 3, 4, 5],
      openHour: '10:00',
      closeHour: '22:00',
      slotDurationInMin: 30,
      admin: { connect: { id: adminId } },
    },
  });
}

// Create tables
async function createTables(restaurantId: string) {
  const tablesData = [
    { tableNo: 'A1', tableSize: 4, status: 'AVAILABLE' as const },
    { tableNo: 'A2', tableSize: 2, status: 'OCCUPIED' as const },
    { tableNo: 'B1', tableSize: 6, status: 'RESERVED' as const },
    { tableNo: 'B2', tableSize: 8, status: 'AVAILABLE' as const },
    { tableNo: 'B3', tableSize: 4, status: 'AVAILABLE' as const },
    { tableNo: 'B4', tableSize: 6, status: 'OCCUPIED' as const },
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

// Create staff
async function createStaff(restaurantId: string) {
  const staffData = [
    { name: 'Jane Smith', phoneNo: '0621481903', role: 'Head Chef' },
    { name: 'Michael Wong', phoneNo: '0621481904', role: 'Sous Chef' },
    { name: 'Emily Davis', phoneNo: '0621481905', role: 'Server' },
    { name: 'David Martinez', phoneNo: '0621481906', role: 'Bartender' },
    { name: 'Sophie Anderson', phoneNo: '0621481907', role: 'Host' },
    { name: 'James Wilson', phoneNo: '0621481908', role: 'Kitchen Porter' },
  ];

  const staff = [];
  for (const data of staffData) {
    staff.push(
      await prisma.staff.create({
        data: { ...data, restaurantId },
      }),
    );
  }
  return staff;
}

// Create queues
async function createQueues(restaurantId: string, customers: any[]) {
  const queuesData = [
    {
      restaurantId,
      customerId: customers[0].id,
      status: 'WAITLIST' as const,
      progressStatus: 'PENDING' as const,
      partySize: 2,
      position: 1,
      timeSlot: new Date(
        new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
          10,
          0,
          0,
          0,
        ),
      ),
    },
    {
      restaurantId,
      customerId: customers[1].id,
      status: 'BOOKING' as const,
      progressStatus: 'PENDING' as const,
      partySize: 2,
      timeSlot: new Date(new Date().setHours(11, 0, 0, 0)),
    },
    {
      restaurantId,
      customerId: customers[2].id,
      status: 'BOOKING' as const,
      progressStatus: 'PENDING' as const,
      partySize: 4,
      timeSlot: new Date(
        new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
          10,
          0,
          0,
          0,
        ),
      ),
    },
    {
      restaurantId,
      customerId: customers[3].id,
      status: 'BOOKING' as const,
      progressStatus: 'PENDING' as const,
      partySize: 2,
      timeSlot: new Date(new Date().setHours(13, 0, 0, 0)),
    },
    {
      restaurantId,
      customerId: customers[4].id,
      status: 'BOOKING' as const,
      progressStatus: 'PENDING' as const,
      partySize: 2,
      timeSlot: new Date(new Date().setHours(11, 0, 0, 0)),
    },
    {
      restaurantId,
      customerId: customers[5].id,
      status: 'BOOKING' as const,
      progressStatus: 'PENDING' as const,
      partySize: 2,
      timeSlot: new Date(new Date().setHours(11, 0, 0, 0)),
    },
  ];

  const queues = [];
  for (const data of queuesData) {
    queues.push(
      await prisma.queue.create({
        data: { ...data, restaurantId },
      }),
    );
  }
  return queues;
}

// Create meals
async function createMeals(restaurantId: string) {
  const mealsData = [
    { name: 'Pasta', price: 12.99, category: 'Fast Food' },
    { name: 'Pizza', price: 15.99, category: 'Fast Food' },
    { name: 'Spicy Sichuan Hotpot Base', price: 18.99, category: 'Hotpot' },
    { name: 'Premium Sliced Beef Plate', price: 16.99, category: 'Hotpot' },
    { name: 'Seafood Combo Platter', price: 24.99, category: 'Hotpot' },
    { name: 'Mixed Mushroom Basket', price: 12.99, category: 'Hotpot' },
    { name: 'Handmade Meatball Assortment', price: 15.99, category: 'Hotpot' },
  ];

  const meals = [];
  for (const data of mealsData) {
    meals.push(
      await prisma.meal.create({
        data: { ...data, restaurantId },
      }),
    );
  }
  return meals;
}

// Create orders and order meals
async function createOrders(
  queueId: string,
  tableId: string,
  customerId: string,
  restaurantId: string,
  meals: any[],
) {
  const order = await prisma.order.create({
    data: { queueId, tableId, customerId, restaurantId },
  });

  await prisma.orderMeal.create({
    data: { orderId: order.id, mealId: meals[0].id, quantity: 1 },
  });

  await prisma.orderMeal.create({
    data: { orderId: order.id, mealId: meals[1].id, quantity: 2 },
  });

  return order;
}

// Create notifications
async function createNotifications(restaurantId: string, customerId: string) {
  return await prisma.notification.create({
    data: {
      restaurantId,
      customerId,
      message: 'Your table is ready!',
    },
  });
}

async function main() {
  await clearDatabase();

  const admin = await createAdmin();
  const customers = await createCustomers();
  const restaurant = await createRestaurant(admin.id);
  const tables = await createTables(restaurant.id);
  const staff = await createStaff(restaurant.id);
  const queues = await createQueues(restaurant.id, customers);
  const meals = await createMeals(restaurant.id);

  // Create an order with the first queue, table, and customer
  const order = await createOrders(
    queues[0].id,
    tables[0].id,
    customers[0].id,
    restaurant.id,
    meals,
  );

  await createNotifications(restaurant.id, customers[0].id);

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
