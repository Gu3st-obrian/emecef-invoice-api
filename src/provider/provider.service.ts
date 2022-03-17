import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IProvider, Provider, ProviderDocument } from './provider.schema';

@Injectable()
export class ProviderService {
    private readonly logger = new Logger(ProviderService.name);

    constructor (
        @InjectModel('provider') 
        private readonly model: Model<ProviderDocument>,
    ) {}

    public async createOne(payload:Provider):Promise<ProviderDocument | null> {
        try {
            return await this.model.create(payload);
        } catch (error) {
            this.logger.error("ProviderService.createOne.error", error);
            return null;
        }
    }

    public async findManyBy(query:IProvider):Promise<ProviderDocument[] | null> {
        try {
            return await this.model.find(query as any).exec();
        } catch (error) {
            this.logger.error("ProviderService.findManyBy.error", error);
            return [];
        }
    }

    public async findOneBy(query:IProvider):Promise<ProviderDocument | null> {
        try {
            return await this.model.findOne(query as any).exec();
        } catch (error) {
            this.logger.error("ProviderService.findOneBy.error", error);
            return null;
        }
    }

    public async updateOne(query:any, data:any) {
        try {
            return await this.model.updateOne(query as any, data).exec();
        } catch (error) {
            this.logger.error("ProviderService.updateOne.error", error);
            return null;
        }
    }

    public async deleteOne(query:any) {
        try {
            return await this.model.deleteOne(query).exec();
        } catch (error) {
            this.logger.error("ProviderService.deleteOne.error", error);
            return null;
        }
    }
}
