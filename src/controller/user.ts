import { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorator/controller';
import { Route } from '../decorator/route';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Validate } from '../decorator/validate';
import { User } from '../models/user';
import { JWT_SECRET_KEY } from '../config/config';
import { Authenticate } from '../decorator/authenticate';

type userRegistration = {
    username: string;
    email: string;
    fullName: string;
    password: string;
};

const userRegistrationValidation = Joi.object<userRegistration>({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    fullName: Joi.string().required(),
    password: Joi.string().required()
});

type userLogin = {
    username: string;
    password: string;
};

const userLoginValidation = Joi.object<userLogin>({
    username: Joi.string().required(),
    password: Joi.string().required()
});

@Controller('/user')
class UserController {
    @Route('post', '/register')
    @Validate(userRegistrationValidation)
    async registerUser(req: Request<{}, {}, userRegistration>, res: Response, next: NextFunction) {
        const { username, email, fullName, password } = req.body;

        try {
            const document = await User.find({ $or: [{ username }, { email }] });

            if (document.length !== 0) {
                return res.status(409).json({ error: 'User Exists' });
            }

            const newUser = new User({
                username,
                email,
                fullName,
                hashPassword: bcrypt.hashSync(password, 10)
            });

            await newUser.save();

            return res.status(201).json({
                token: jwt.sign(
                    {
                        id: newUser._id,
                        username,
                        email
                    },
                    JWT_SECRET_KEY
                )
            });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    @Route('post', '/login')
    @Validate(userLoginValidation)
    async userLogin(req: Request<{}, {}, userLogin>, res: Response, next: NextFunction) {
        const { username, password } = req.body;

        try {
            const user = await User.findOne({ username });

            if (user && user.comparePassword(password)) {
                return res.status(201).json({
                    token: jwt.sign(
                        {
                            id: user._id,
                            username: user.username,
                            email: user.email
                        },
                        JWT_SECRET_KEY
                    )
                });
            }

            return res.status(403).json({ error: 'Either username or password is incorrect' });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    @Route('get')
    @Authenticate()
    async getUserData(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.user) {
                const user = await User.findById(req.user.id).select('-_id -hashPassword');

                if (user) {
                    return res.status(200).json(user);
                }

                return res.status(403).json({ error: 'User not found' });
            }
        } catch (error) {
            return res.status(403).json({ error: 'Internal Server Error' });
        }
    }
}

export default UserController;
