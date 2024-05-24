import { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorator/controller';
import { Route } from '../decorator/route';
import { Validate } from '../decorator/validate';
import Joi from 'joi';
import { Authenticate } from '../decorator/authenticate';

@Controller('/main')
class MainController {
    @Route('get', '/healthcheck')
    @Authenticate()
    getHealthCheck(req: Request, res: Response, next: NextFunction) {
        logging.info('Healthcheck route called successfully!');
        return res.status(200).json({ hello: 'world!' });
    }
}

export default MainController;
