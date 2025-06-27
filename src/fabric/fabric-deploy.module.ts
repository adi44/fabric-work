// src/fabric/fabric-deploy.module.ts
import { Module } from '@nestjs/common';
import { FabricDeployService } from './fabric-deploy.service.js';
import { FabricDeployController } from './fabric-deploy.controller.js';

@Module({
  providers: [FabricDeployService],
  controllers: [FabricDeployController],
})
export class FabricDeployModule {}