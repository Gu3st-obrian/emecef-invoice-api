import { Injectable } from '@nestjs/common';
import { ProviderDocument } from 'src/provider/provider.schema';

@Injectable()
export class GlobalService {
    static appName: string;
    static hasProvider: boolean;
    static provider: ProviderDocument;
}
