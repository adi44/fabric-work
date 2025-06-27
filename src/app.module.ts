import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { FabricDeployModule } from './fabric/fabric-deploy.module.js'; // Import your module

@Module({
  imports: [FabricDeployModule], // Add your module here
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}