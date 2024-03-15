import { USER_ROLE } from "@gramflow/db";

declare global {
    namespace Express {
        export interface Request {
            auth: {
                name: string;
                email: string;
                picture: string;
                sub: string;
                role: USER_ROLE;
                iat: number;
                exp: number;
                jti: string;

            }
        }
    }
}

declare module '@ts-rest/express' {
    interface TsRestRequest {
        auth: {
            name: string;
            email: string;
            picture: string;
            sub: string;
            role: string;
            iat: number;
            exp: number;
            jti: string;
        }
    }
}
