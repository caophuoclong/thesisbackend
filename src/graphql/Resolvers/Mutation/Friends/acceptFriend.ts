import { ErrorType } from "../../../../enum";
import { FriendService } from "../../../../services/Friend";
import { AuthResult } from "express-oauth2-jwt-bearer";

export default async function acceptFriend(parent, {input: {_id}}, context: AuthResult, info){
    console.log("🚀 ~ file: acceptFriend.ts:6 ~ acceptFriend ~ _id:", _id)
    try {
        const { sub } = context.payload;
        if (!sub) return Error(ErrorType.NOT_AUTHORIZED);
        return FriendService.acceptFriend(sub!, _id);
    } catch (error) {
        console.log("🚀 ~ file: addFriend.ts:43 ~ addFriend ~ error:", error);
        return Error(error);
    }

}