// src/fabric/fabric-deploy.controller.ts
import {
    Controller, Post
} from '@nestjs/common';
import { FabricDeployService } from './fabric-deploy.service.js';

@Controller('fabric')
export class FabricDeployController {
    constructor(private readonly fabricDeployService: FabricDeployService) {}

    @Post('deploy-subscription')
    async deploySubscription() {
        return this.fabricDeployService.deploySubscription();
    }
}