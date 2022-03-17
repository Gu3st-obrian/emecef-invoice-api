import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProviderHistory, ProviderHistoryDocument } from './provider-history.schema';

@Injectable()
export class ProviderHistoryService {
    private readonly logger = new Logger(ProviderHistoryService.name);

    constructor (
        @InjectModel('provider-history') private readonly model: Model<ProviderHistoryDocument>,
    ) {}

    public async createOne(payload:ProviderHistory):Promise<ProviderHistoryDocument | null> {
        try {
            return await this.model.create(payload);
        } catch (error) {
            this.logger.error("ProviderHistoryService.createOne.error", error);
            return null;
        }
    }
}
