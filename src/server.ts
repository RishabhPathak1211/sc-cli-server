import http from 'http';
import express from 'express';
import 'reflect-metadata';
import cors from 'cors';
import { loggingHandler } from './middleware/loggingHandler';
import { corsHandler } from './middleware/corsHandler';
import { routeNotFound } from './middleware/routeNotFound';
import { MONGO, SERVER } from './config/config';
import './config/logging';
import { defineRoutes } from './modules/routes';
import MainController from './controller/main';
import PackageController from './controller/package';
import mongoose from 'mongoose';
import { declareHandler } from './middleware/declareHandler';
import UserController from './controller/user';
import TemplateController from './controller/template';

export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = async () => {
    logging.info('------------------------------');
    logging.info('Initializing API');
    logging.info('------------------------------');
    application.use(express.urlencoded({ extended: true }));
    application.use(express.json());

    logging.info('------------------------------');
    logging.info('Connecting to Mongo');
    logging.info('------------------------------');
    try {
        const connection = await mongoose.connect(MONGO.MONGO_CONNECTION, MONGO.MONGO_OPTIONS);
        logging.info('------------------------------');
        logging.info('Connected to Mongo: ', connection.version);
        logging.info('------------------------------');
    } catch (error) {
        logging.info('------------------------------');
        logging.info('Unable to connect to Mongo');
        logging.error(error);
        logging.info('------------------------------');
    }

    logging.info('------------------------------');
    logging.info('Logging & Configuration');
    logging.info('------------------------------');
    application.use(declareHandler);
    application.use(loggingHandler);
    // application.use(corsHandler);
    application.use(cors());

    logging.info('------------------------------');
    logging.info('Define Controller Routing');
    logging.info('------------------------------');
    defineRoutes([
        MainController,
        PackageController,
        UserController,
        TemplateController
    ], application);

    logging.info('------------------------------');
    logging.info('Error Routing');
    logging.info('------------------------------');
    application.use(routeNotFound);

    logging.info('------------------------------');
    logging.info('Start Server');
    logging.info('------------------------------');
    httpServer = http.createServer(application);
    httpServer.listen(SERVER.SERVER_PORT, () => {
        logging.info('------------------------------');
        logging.info('Server Started: ' + SERVER.SERVER_HOSTNAME + ':' + SERVER.SERVER_PORT);
        logging.info('------------------------------');
    });
};

export const ShutDown = (calback: any) => httpServer && httpServer.close(calback);

Main();
