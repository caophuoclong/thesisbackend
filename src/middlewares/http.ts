import { NextFunction, Request, Response } from "express";
import { verifyToken } from '.';

// export const httpAuthenticator = async (req: Request, res: Response, next: NextFunction) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     try {
//         const user = await verifyToken(token);
//         next()
//     } catch (error) {
//         console.log("Error");
//     }
// }