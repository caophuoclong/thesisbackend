import { JWTPayload } from "express-oauth2-jwt-bearer";
import { readFileSync, existsSync } from "fs";
import * as jwt from "jsonwebtoken";
import path from "path";
export const verifyToken = async (token: string) => {
    try {
        const pathToFile = path.join(__dirname, "public.pem");
        if (!existsSync(pathToFile)) throw new Error("No public key found");
        const cert = readFileSync(pathToFile, "utf-8");
        const payload = jwt.verify(token, cert, {
            algorithms: ["RS256"],
        });
        return payload as JWTPayload;
    } catch (error) {
        console.log("🚀 ~ file: index.ts:13 ~ verifyToken ~ error:", error);
        throw new Error(error);
    }
};
