
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';
import { GlobalService } from './global/global.service';

@Injectable()
export class ProtectedMiddleware implements NestMiddleware {

    async use(req: Request, res: Response, next: NextFunction) {

        // For setting up routes, don't use the default token.
        if (!GlobalService.hasProvider) {
            return res.status(HttpStatus.PRECONDITION_REQUIRED).send({
                statusCode: HttpStatus.PRECONDITION_REQUIRED,
                reason: "UNKNOW_PROVIDER",
            });
        }


        next();
    }
}
