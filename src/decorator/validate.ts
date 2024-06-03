import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

type ValidationType = 'body' | 'params' | 'query';

export function Validate(schema: Joi.ObjectSchema, validationType: ValidationType = 'body') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod: Function = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                switch (validationType) {
                    case 'body': {
                        await schema.validateAsync(req.body);
                        break;
                    }
                    case 'params': {
                        await schema.validateAsync(req.params);
                        break;
                    }
                    case 'query': {
                        await schema.validateAsync(req.query);
                        break;
                    }
                    default: {
                        throw new Error('Invalid validation type')
                    }
                }
            } catch (error) {
                logging.error(error);

                return res.status(422).json(error);
            }

            return originalMethod.call(this, req, res, next);
        };

        return descriptor;
    };
}
