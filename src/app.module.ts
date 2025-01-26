import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { RestaurantModule } from './restaurants/restaurants.module';

@Module({
  imports: [AdminModule, ConfigModule.forRoot(), RestaurantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
