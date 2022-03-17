import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';


async function bootstrap() {

    const app = await NestFactory.create(AppModule);
    const configService = app.get<ConfigService>(ConfigService);
    app.enableCors();

    //
    const port = configService.get<number>("http.port");
    console.log('application port : ', port);
    await app.listen(port);
}
bootstrap();
