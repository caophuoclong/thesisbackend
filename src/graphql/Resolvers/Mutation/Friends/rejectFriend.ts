import { ErrorType } from "../../../../enum";
import { FriendService } from "../../../../services/Friend";
import { AuthResult } from "express-oauth2-jwt-bearer";

export default async function rejectFriend(parent, {input: {_id}}, context: AuthResult, info){
    try {
        const { sub } = context.payload;
        if (!sub) return Error(ErrorType.NOT_AUTHORIZED);
        return FriendService.rejectFriend(sub!, _id);
    } catch (error) {
        console.log("🚀 ~ file: addFriend.ts:43 ~ addFriend ~ error:", error);
        return Error(error);
    }

}