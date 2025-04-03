import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admins/admins.module';
import { ConfigModule } from '@nestjs/config';
import { RestaurantModule } from './restaurants/restaurants.module';
import { CustomersModule } from './customers/customers.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TablesModule } from './tables/tables.module';
import { StaffsModule } from './staffs/staffs.module';
import { MealsModule } from './meals/meals.module';
import { join } from 'path';
import { QueueModule } from './queues/queue.module';
console.log('Serving static files from:', join(process.cwd(), 'uploads'));

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AdminModule,
    ConfigModule.forRoot(),
    RestaurantModule,
    CustomersModule,
    TablesModule,
    StaffsModule,
    MealsModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
