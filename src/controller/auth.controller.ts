import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import UserModel from "../models/User.model";
interface ISignupUser {
    id: string;
    email: string;
    firstName: string;
    created_at: number;
    updated_at: number;
    username: string;
    avatar: string;
    email_verified: boolean;
    picture: string;
}
export const authController = {
    onSignUp: async (req: Request<{}, {}, ISignupUser>, res: Response) => {
        const { id, email, email_verified, username, firstName, picture, avatar, created_at, updated_at } = req.body;
        console.log("🚀 ~ file: auth.controller.ts:18 ~ onSignUp: ~ updated_at:", updated_at)
        console.log("🚀 ~ file: auth.controller.ts:18 ~ onSignUp: ~ created_at:", created_at)
        const existedUser = await UserModel.findById(id);
        if (existedUser) {
            return res.send("ok");
        }
        const newUser = new UserModel({
            _id: id,
            email,
            email_verified,
            username: username ? username : email,
            firstName: firstName ? firstName : username,
            avatar: avatar ? avatar : picture,
            createdAt: created_at ? created_at : Date.now(),
            updatedAt: updated_at ? updated_at : Date.now(),
        })
        await newUser.save();        
        res.send("ok");
    },
};
