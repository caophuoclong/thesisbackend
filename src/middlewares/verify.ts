import { NextFunction, Request, Response } from "express";

export const verify = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["x-token"];
    console.log("🚀 ~ file: verify.ts:5 ~ verify ~ authorization:", token);
    next();
};
