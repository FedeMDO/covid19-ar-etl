import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileDownloadModule } from './file-download/file-download.module';
import { TerritoryStatusModule } from './territory-status/territory-status.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DataTransformModule } from './data-transform/data-transform.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FileDownloadModule,
    TerritoryStatusModule,
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    DataTransformModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
