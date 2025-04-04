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
  const restaurantsData = [
    {
      name: 'The Great Restaurant',
      slug: 'the-great-restaurant',
      location: '123 Main St',
      qrCode: 'some-qr-code-1',
      sharedLink: 'http://example.com/restaurant-1',
      openDays: [1, 2, 3, 4, 5],
      openHour: '10:00',
      closeHour: '22:00',
      slotDurationInMin: 60,
    },
    {
      name: 'Sushi Paradise',
      slug: 'sushi-paradise',
      location: '456 Ocean Ave',
      qrCode: 'some-qr-code-2',
      sharedLink: 'http://example.com/restaurant-2',
      openDays: [1, 2, 3, 4, 5, 6],
      openHour: '11:00',
      closeHour: '23:00',
      slotDurationInMin: 60,
    },
    {
      name: 'Italian Villa',
      slug: 'italian-villa',
      location: '789 Pasta Lane',
      qrCode: 'some-qr-code-3',
      sharedLink: 'http://example.com/restaurant-3',
      openDays: [2, 3, 4, 5, 6, 7],
      openHour: '12:00',
      closeHour: '21:00',
      slotDurationInMin: 90,
    },
    {
      name: 'Spice Garden',
      slug: 'spice-garden',
      location: '321 Curry Road',
      qrCode: 'some-qr-code-4',
      sharedLink: 'http://example.com/restaurant-4',
      openDays: [1, 2, 3, 4, 5, 6, 7],
      openHour: '11:30',
      closeHour: '22:30',
      slotDurationInMin: 120,
    },
    {
      name: 'BBQ House',
      slug: 'bbq-house',
      location: '567 Smoke Street',
      qrCode: 'some-qr-code-5',
      sharedLink: 'http://example.com/restaurant-5',
      openDays: [3, 4, 5, 6, 7],
      openHour: '16:00',
      closeHour: '23:00',
      slotDurationInMin: 120,
    },
  ];

  const restaurants = [];
  for (const data of restaurantsData) {
    restaurants.push(
      await prisma.restaurant.create({
        data: { ...data, adminId },
      }),
    );
  }
  return restaurants;
}

// Create tables
async function createTables(restaurantId: string) {
  const tablesData = [
    { tableNo: 'A1', tableSize: 4 },
    { tableNo: 'A2', tableSize: 2 },
    { tableNo: 'B1', tableSize: 6 },
    { tableNo: 'B2', tableSize: 10 },
    { tableNo: 'B3', tableSize: 8 },
    { tableNo: 'B4', tableSize: 6 },
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
async function createQueues(
  restaurantId: string,
  customers: any[],
  tables: any[],
) {
  const generateQueueNo = (table: any, timeSlot: Date) => {
    const month = (timeSlot.getMonth() + 1).toString().padStart(2, '0');
    const day = timeSlot.getDate().toString().padStart(2, '0');
    const hours = timeSlot.getHours().toString().padStart(2, '0');
    const minutes = timeSlot.getMinutes().toString().padStart(2, '0');
    return `${table.tableNo}-${month}${day}-${hours}${minutes}`;
  };

  const queuesData = [
    {
      restaurantId,
      customerId: customers[0].id,
      status: 'COMPLETED' as const,
      progressStatus: 'CONFIRMED' as const,
      partySize: 2,
      position: 1,
      tableId: tables[0].id,
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
      status: 'COMPLETED' as const,
      progressStatus: 'CONFIRMED' as const,
      partySize: 3,
      tableId: tables[0].id,
      timeSlot: new Date(new Date().setHours(19, 0, 0, 0)),
    },
    {
      restaurantId,
      customerId: customers[1].id,
      status: 'COMPLETED' as const,
      progressStatus: 'CONFIRMED' as const,
      partySize: 2,
      tableId: tables[1].id,
      timeSlot: new Date(new Date().setHours(19, 0, 0, 0)),
    },
    {
      restaurantId,
      customerId: customers[3].id,
      status: 'WAITLIST' as const,
      progressStatus: 'CONFIRMED' as const,
      partySize: 2,
      tableId: tables[0].id,
      timeSlot: new Date(new Date().setHours(20, 0, 0, 0)),
    },
    {
      restaurantId,
      customerId: customers[4].id,
      status: 'BOOKING' as const,
      progressStatus: 'PENDING' as const,
      partySize: 2,
      tableId: tables[0].id,
      timeSlot: new Date(new Date().setHours(21, 0, 0, 0)),
    },
    {
      restaurantId,
      customerId: customers[5].id,
      status: 'BOOKING' as const,
      progressStatus: 'PENDING' as const,
      partySize: 2,
      tableId: tables[1].id,
      timeSlot: new Date(new Date().setHours(21, 0, 0, 0)),
    },
    ...new Array(tables.length).fill(null).map((_, index) => ({
      restaurantId,
      customerId: customers[index].id,
      status: 'BOOKING' as const,
      progressStatus: 'PENDING' as const,
      partySize: 4,
      tableId: tables[index].id,
      timeSlot: new Date(
        new Date(new Date().setDate(new Date().getDate() + 3)).setHours(
          11,
          0,
          0,
          0,
        ),
      ),
    })),
    ...new Array(5).fill(null).map((_, index) => ({
      restaurantId,
      customerId: customers[2].id,
      status: 'BOOKING' as const,
      progressStatus: 'PENDING' as const,
      partySize: 4,
      tableId: tables[index].id,
      timeSlot: new Date(
        new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
          12,
          0,
          0,
          0,
        ),
      ),
    })),
    ...new Array(6).fill(null).map((_, index) => ({
      restaurantId,
      customerId: customers[2].id,
      status: 'BOOKING' as const,
      progressStatus: 'PENDING' as const,
      partySize: 4,
      tableId: tables[index].id,
      timeSlot: new Date(
        new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
          13,
          0,
          0,
          0,
        ),
      ),
    })),
  ];

  const queues = [];
  for (const data of queuesData) {
    const { tableId, timeSlot, ...queueData } = data;
    const table = tables.find((t) => t.id === tableId);
    const queueNo = generateQueueNo(table, timeSlot);

    const newQueue = await prisma.queue.create({
      data: {
        ...queueData,
        restaurantId,
        tableId,
        timeSlot,
        queueNo,
      },
    });
    queues.push(newQueue);
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

  return;

  const admin = await createAdmin();
  const customers = await createCustomers();
  const restaurants = await createRestaurant(admin.id);
  const tables = await createTables(restaurants[0].id);
  const moreTables = await createTables(restaurants[1].id);
  const staff = await createStaff(restaurants[0].id);
  const moreStaff = await createStaff(restaurants[1].id);
  const queues = await createQueues(restaurants[0].id, customers, tables);
  const moreQueues = await createQueues(
    restaurants[1].id,
    customers,
    moreTables,
  );
  const meals = await createMeals(restaurants[0].id);
  const moreMeals = await createMeals(restaurants[1].id);
  // Create an order with the first queue, table, and customer
  const order = await createOrders(
    queues[0].id,
    tables[0].id,
    customers[0].id,
    restaurants[0].id,
    meals,
  );

  await createNotifications(restaurants[0].id, customers[0].id);

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
