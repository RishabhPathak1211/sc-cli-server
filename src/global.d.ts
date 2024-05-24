import { Request } from "express";
import { JWTUserData } from "./library/user";
import { IncomingHttpHeaders } from "http";

declare global {
    namespace Express {
        interface Request {
            mongoGet: Document | undefined;
            mongoGetAll: Document[];
            mongoCreate: Document | undefined;
            mongoUpdate: Document | undefined;
            mongoQuery: Document[];

            user: JWTUserData | undefined;
        }

        namespace Multer {
            interface File {
                key: string;
            }
        }
    }
}

declare global {
    var logging: {
        log: (message?: any, ...optionalParams: any[]) => void;
        info: (message?: any, ...optionalParams: any[]) => void;
        warn: (message?: any, ...optionalParams: any[]) => void;
        warning: (message?: any, ...optionalParams: any[]) => void;
        error: (message?: any, ...optionalParams: any[]) => void;
        getCallingFunction: (error: Error) => string;
    };
}

declare module 'http' {
    interface IncomingHttpHeaders {
        consumerkey?: string;
    }
}
