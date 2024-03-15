import { USER_ROLE } from "@gramflow/db";
import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        role: USER_ROLE;
    }
}