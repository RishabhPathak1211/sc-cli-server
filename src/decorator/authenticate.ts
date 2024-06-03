import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config/config';
import { JWTUserData } from '../library/user';
import { User } from '../models/user';

type AuthType = 'token' | 'consumerKey';

export function Authenticate(authType: AuthType = 'token') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod: Function = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            switch (authType) {
                case 'token':
                    {
                        if (req.headers?.authorization) {
                            const authorizationArray = req.headers.authorization.split(' ');

                            if (authorizationArray.length == 2 && authorizationArray[0] === 'Bearer') {
                                const token = authorizationArray[1];
                                try {
                                    const userData: JWTUserData = jwt.verify(token, JWT_SECRET_KEY) as JWTUserData;
                                    req.user = userData;
                                } catch (error) {
                                    if (error instanceof JsonWebTokenError) {
                                        return res.status(403).json({ error: 'Incorrect Token' });
                                    }
                                    return res.status(500).json({ error: 'Internal Server Error' });
                                }
                            } else {
                                req.user = undefined;
                                return res.status(403).json({ error: 'Unauthorized' });
                            }
                        } else {
                            req.user = undefined;
                            return res.status(403).json({ error: 'Unauthorized' });
                        }
                    }
                    break;

                case 'consumerKey': {
                    if (req.headers.consumerkey) {
                        const userDoc = await User.findOne({ consumerKey: req.headers.consumerkey });

                        if (userDoc) {
                            req.user = {
                                id: userDoc._id.toString(),
                                username: userDoc.username,
                                email: userDoc.email
                            }
                        } else {
                            req.user = undefined;
                            return res.status(403).json({ error: 'Incorrect Consumer Key' });
                        }
                    } else {
                        req.user = undefined;
                        return res.status(403).json({ error: 'Unauthorized' });
                    }
                    break;
                }
            }

            originalMethod.call(this, req, res, next);
        };

        return descriptor;
    };
}
