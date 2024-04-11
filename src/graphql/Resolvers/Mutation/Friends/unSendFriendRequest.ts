import { ErrorType, FriendStatus, ResponseStatus } from "../../../../enum";
import { FriendsModel } from "../../../../models/Friends.model";
import UserModel from "../../../../models/User.model";
import { FriendService } from "../../../../services/Friend";
import { Error } from "../../../../utils/Error";
import { Response } from "../../../../utils/Response";
import { AuthResult } from "express-oauth2-jwt-bearer";

export default async function unSendFriendRequest(parent, { input: { _id } }, context: AuthResult, info) {
    try {
        const { sub } = context.payload;
        if (!sub) return Error(ErrorType.NOT_AUTHORIZED);
        return FriendService.unSendRequest(sub!, _id);
    } catch (error) {
        return Error(ErrorType.UNKNOWN, error.message);
    }
}
