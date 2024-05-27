import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const DEVELOPMENT = process.env.NODE_ENV === 'development';
export const TEST = process.env.NODE_ENV === 'test';

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 8000;

export const SERVER = {
    SERVER_HOSTNAME,
    SERVER_PORT
};

const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || '';
const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION || '';

export const S3_CREDENTIALS = {
    S3_ACCESS_KEY,
    S3_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME,
    S3_BUCKET_REGION
};

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/';
const MONGO_DATABASE = process.env.MONGO_DATABASE || '';
const MONGO_OPTIONS: mongoose.ConnectOptions = { retryWrites: true, w: 'majority' };

export const MONGO = {
    MONGO_URL,
    MONGO_DATABASE,
    MONGO_OPTIONS,
    MONGO_CONNECTION: process.env.MONGO_CONNECTION || MONGO_URL + MONGO_DATABASE
};

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'secret';
