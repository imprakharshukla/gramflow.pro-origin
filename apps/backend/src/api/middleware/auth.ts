import { USER_ROLE } from "@gramflow/db";
import { NextFunction, Response } from "express";

function adminOnlyMiddleware<T>(req: T, res: Response, next: NextFunction) {
    const roles = [USER_ROLE.ADMIN.valueOf(), USER_ROLE.SUPER_ADMIN.valueOf()];
    // @ts-ignore
    if (roles.includes(req.auth.role)) {
        return next();
    } else {
        return res.status(401).json({ message: "Unauthorized" });
    }
};
function userMiddleware<T>(req: T, res: Response, next: NextFunction) {
    const roles = [USER_ROLE.ADMIN.valueOf(), USER_ROLE.SUPER_ADMIN.valueOf(), USER_ROLE.USER.valueOf()];
    // @ts-ignore
    if (roles.includes(req.auth.role)) {
        return next();
    } else {
        return res.status(401).json({ message: "Unauthorized" });
    }
};


export {
    adminOnlyMiddleware,
    userMiddleware
}


// - opd block 4th pgi hepa OPD Dr.amit goel, proff HoD. 9 - 9: 15 am
//     - no mobile report / all report
//         - all pres.
// - all info.of patient
//     - drug history