import { PrismaClient } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Define an array of model names in the order they should be cleared
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

  function getHashedPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  // Create a Super Admin
  const superAdmin = await prisma.admin.create({
    data: {
      phoneNo: '0621481906',
      name: 'Super Admin',
      password: getHashedPassword('$0meTimes1999'),
    },
  });

  // Create a Customer
  const customer1 = await prisma.customer.create({
    data: {
      phoneNo: '0621481902',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: getHashedPassword('$0meTimes1999'),
      isAccountCreated: true,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      phoneNo: '0621482332',
      name: 'Berry',
      email: null,
      password: null,
      isAccountCreated: false,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      phoneNo: '0621483443',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      password: getHashedPassword('Wilson@2024'),
      isAccountCreated: true,
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      phoneNo: '0621484554',
      name: 'Mike Chen',
      email: null,
      password: null,
      isAccountCreated: false,
    },
  });

  const customer5 = await prisma.customer.create({
    data: {
      phoneNo: '0621485665',
      name: 'Emma Thompson',
      email: 'emma.t@example.com',
      password: getHashedPassword('EmmaT@2024'),
      isAccountCreated: true,
    },
  });

  const customer6 = await prisma.customer.create({
    data: {
      phoneNo: '0621486776',
      name: 'Alex Rodriguez',
      email: 'alex.r@example.com',
      password: getHashedPassword('Alex@2024'),
      isAccountCreated: true,
    },
  });

  const customer7 = await prisma.customer.create({
    data: {
      phoneNo: '0621487887',
      name: 'Lisa Kumar',
      email: null,
      password: null,
      isAccountCreated: false,
    },
  });

  // Create a Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'The Great Restaurant',
      location: '123 Main St',
      qrCode: 'some-qr-code',
      sharedLink: 'http://example.com/restaurant',
      admin: {
        connect: {
          id: superAdmin.id,
        },
      },
    },
  });

  // Create a Table
  const table = await prisma.table.create({
    data: {
      tableNo: 'A1',
      tableSize: 4,
      status: 'AVAILABLE',
      restaurantId: restaurant.id,
    },
  });

  const table2 = await prisma.table.create({
    data: {
      tableNo: 'A2',
      tableSize: 2,
      status: 'OCCUPIED',
      restaurantId: restaurant.id,
    },
  });

  const table3 = await prisma.table.create({
    data: {
      tableNo: 'B1',
      tableSize: 6,
      status: 'RESERVED',
      restaurantId: restaurant.id,
    },
  });

  const table4 = await prisma.table.create({
    data: {
      tableNo: 'B2',
      tableSize: 8,
      status: 'AVAILABLE',
      restaurantId: restaurant.id,
    },
  });

  const table5 = await prisma.table.create({
    data: {
      tableNo: 'B3',
      tableSize: 4,
      status: 'AVAILABLE',
      restaurantId: restaurant.id,
    },
  });

  const table6 = await prisma.table.create({
    data: {
      tableNo: 'B4',
      tableSize: 6,
      status: 'OCCUPIED',
      restaurantId: restaurant.id,
    },
  });

  // Create Staff
  const staff = await prisma.staff.create({
    data: {
      name: 'Jane Smith',
      phoneNo: '0621481903',
      role: 'Head Chef',
      restaurantId: restaurant.id,
    },
  });

  const staff2 = await prisma.staff.create({
    data: {
      name: 'Michael Wong',
      phoneNo: '0621481904',
      role: 'Sous Chef',
      restaurantId: restaurant.id,
    },
  });

  const staff3 = await prisma.staff.create({
    data: {
      name: 'Emily Davis',
      phoneNo: '0621481905',
      role: 'Server',
      restaurantId: restaurant.id,
    },
  });

  const staff4 = await prisma.staff.create({
    data: {
      name: 'David Martinez',
      phoneNo: '0621481906',
      role: 'Bartender',
      restaurantId: restaurant.id,
    },
  });

  const staff5 = await prisma.staff.create({
    data: {
      name: 'Sophie Anderson',
      phoneNo: '0621481907',
      role: 'Host',
      restaurantId: restaurant.id,
    },
  });

  const staff6 = await prisma.staff.create({
    data: {
      name: 'James Wilson',
      phoneNo: '0621481908',
      role: 'Kitchen Porter',
      restaurantId: restaurant.id,
    },
  });

  // Create a Queue
  const queue = await prisma.queue.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer1.id,
      status: 'WAITLIST',
      progressStatus: 'PENDING',
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
  });

  const queue2 = await prisma.queue.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer2.id,
      status: 'BOOKING',
      progressStatus: 'PENDING',
      partySize: 2,
      timeSlot: new Date(new Date().setHours(11, 0, 0, 0)),
    },
  });

  const queue3 = await prisma.queue.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer3.id,
      status: 'BOOKING',
      progressStatus: 'PENDING',
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
  });

  const queue4 = await prisma.queue.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer4.id,
      status: 'BOOKING',
      progressStatus: 'PENDING',
      partySize: 2,
      timeSlot: new Date(new Date().setHours(13, 0, 0, 0)),
    },
  });

  const queue5 = await prisma.queue.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer5.id,
      status: 'BOOKING',
      progressStatus: 'PENDING',
      partySize: 2,
      timeSlot: new Date(new Date().setHours(11, 0, 0, 0)),
    },
  });

  const queue6 = await prisma.queue.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer6.id,
      status: 'BOOKING',
      progressStatus: 'PENDING',
      partySize: 2,
      timeSlot: new Date(new Date().setHours(11, 0, 0, 0)),
    },
  });

  const order = await prisma.order.create({
    data: {
      queueId: queue.id,
      tableId: table.id,
      customerId: customer1.id,
      restaurantId: restaurant.id,
    },
  });

  // Create Meals
  const meal1 = await prisma.meal.create({
    data: {
      name: 'Pasta',
      price: 12.99,
      category: 'Fast Food',
      restaurantId: restaurant.id,
    },
  });

  const meal2 = await prisma.meal.create({
    data: {
      name: 'Pizza',
      price: 15.99,
      category: 'Fast Food',
      restaurantId: restaurant.id,
    },
  });

  const meal3 = await prisma.meal.create({
    data: {
      name: 'Spicy Sichuan Hotpot Base',
      price: 18.99,
      category: 'Hotpot',
      restaurantId: restaurant.id,
    },
  });

  const meal4 = await prisma.meal.create({
    data: {
      name: 'Premium Sliced Beef Plate',
      price: 16.99,
      category: 'Hotpot',
      restaurantId: restaurant.id,
    },
  });

  const meal5 = await prisma.meal.create({
    data: {
      name: 'Seafood Combo Platter',
      price: 24.99,
      category: 'Hotpot',
      restaurantId: restaurant.id,
    },
  });

  const meal6 = await prisma.meal.create({
    data: {
      name: 'Mixed Mushroom Basket',
      price: 12.99,
      category: 'Hotpot',
      restaurantId: restaurant.id,
    },
  });

  const meal7 = await prisma.meal.create({
    data: {
      name: 'Handmade Meatball Assortment',
      price: 15.99,
      category: 'Hotpot',
      restaurantId: restaurant.id,
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
      customerId: customer1.id,
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
