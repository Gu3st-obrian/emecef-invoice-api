import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppMiddleware } from './app.middleware';
import { ProtectedMiddleware } from './protected.middleware';
import configuration from './configuration/configuration';
import { InvoiceModule } from './v1/invoice/invoice.module';
import { InfoModule } from './v1/info/info.module';
import { CommonModule } from './common/common.module';
import { ProviderModule } from './provider/provider.module';
import { GlobalModule } from './global/global.module';
import { ProviderHistoryModule } from './provider-history/provider-history.module';
import { HealthModule } from './health/health.module';

@Module({
    imports: [

        ConfigModule.forRoot({
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                    .valid('local', 'development', 'production')
                    .default('local'),
            }),
            cache: true,
            isGlobal: true,
            load: [configuration],
        }),

        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                console.log("database :", configService.get<string>("app.database"));
                return {
                    uri: configService.get<string>("app.database"),
                    useNewUrlParser: true,
                };
            },
            inject: [ConfigService],
        }),

        TerminusModule,

        HttpModule,

        HealthModule,

        GlobalModule,

        CommonModule,

        ProviderModule,

        ProviderHistoryModule,

        InvoiceModule,

        InfoModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AppMiddleware).exclude(
            { path: "health/status", method: RequestMethod.GET },
            { path: "provider", method: RequestMethod.POST },
        ).forRoutes({
            path: '*',
            method: RequestMethod.ALL,
        }).apply(ProtectedMiddleware).forRoutes(
            // Any invoice call request require provider Id.
            { path: 'v1/invoice/(.*)', method: RequestMethod.ALL },
            // Any provider status require provider Id.
            { path: "provider/status", method: RequestMethod.PUT },
            // Any provider details request require provider Id.
            { path: "provider", method: RequestMethod.GET },
        );
    }
}