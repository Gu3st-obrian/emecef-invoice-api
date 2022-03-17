import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private readonly configService: ConfigService,
    ) {}

    @Get("status")
    @HealthCheck()
    check() {
        return this.health.check([
            
            () => this.http.pingCheck('mail', this.configService.get<string>('bomboo.emailUrl'), {
                method: 'POST',
                headers: {
                    api_key: this.configService.get<string>('bomboo.apiKey'),
                }
            }),

        ]);
    }
}
