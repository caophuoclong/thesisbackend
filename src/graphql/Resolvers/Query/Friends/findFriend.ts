import UserModel from "../../../../models/User.model";
import { AuthResult } from "express-oauth2-jwt-bearer";

export default async function findFriend(parent, {q}, context: AuthResult){
    console.log("🚀 ~ file: findFriend.ts:5 ~ findFriend ~ q:", q)
    const user = await UserModel.findOne({
        $or: [
            {email: q},
            {username: q},
        ]
    })
    console.log("🚀 ~ file: findFriend.ts:11 ~ findFriend ~ user:", user)
    if(user && user._id === context.payload.sub) return null;

    return user;
}