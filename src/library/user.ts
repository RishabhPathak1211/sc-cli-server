import { JwtPayload } from "jsonwebtoken";

export interface JWTUserData extends JwtPayload {
    id: string;
    username: string;
    email: string;
    iat?: number;
}
